import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { uploadFile, deleteMedia } from "@/lib/media/upload";
import { getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson, adminMiddleware } from "@/lib/audit";
import { ok, created, notFound, badRequest } from "@/lib/api/response";

// File type validation using magic numbers (file signatures)
const FILE_SIGNATURES = {
  // Images
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF], // JPEG
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WebP uses RIFF container)
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  // PDFs
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  // MS Word
  'application/msword': [
    [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // MS Office compound document
  ],
} as const;

function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signatures) return false;

  return signatures.some(signature => {
    if (buffer.length < signature.length) return false;
    return signature.every((byte, index) => buffer[index] === byte);
  });
}

function validateWebPSignature(buffer: Buffer): boolean {
  // WebP files start with RIFF and have WEBP at offset 8
  if (buffer.length < 12) return false;
  const riffHeader = [0x52, 0x49, 0x46, 0x46]; // RIFF
  const webpHeader = [0x57, 0x45, 0x42, 0x50]; // WEBP
  
  const hasRiff = riffHeader.every((byte, index) => buffer[index] === byte);
  const hasWebp = webpHeader.every((byte, index) => buffer[index + 8] === byte);
  
  return hasRiff && hasWebp;
}

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || "5") * 1024 * 1024;
const MAX_BATCH_FILES = 10;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
];

const upload = new Hono().use(adminMiddleware)

  .post("/", async (c) => {

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return badRequest(c, "No file provided");
    }

    if (file.size > MAX_FILE_SIZE) {
      return badRequest(c, `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return badRequest(c, "File type not allowed");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file signature matches claimed MIME type (prevents file type spoofing)
    let isValidSignature = false;
    if (file.type === 'image/webp') {
      isValidSignature = validateWebPSignature(buffer);
    } else if (file.type === 'image/svg+xml') {
      // SVGs have no magic bytes — validate it's parseable XML and sanitize it
      isValidSignature = true;
    } else {
      isValidSignature = validateFileSignature(buffer, file.type);
    }

    if (!isValidSignature) {
      return badRequest(c, "File content does not match declared file type");
    }

    // Sanitize SVG to remove scripts and event handlers (XSS prevention)
    let uploadBuffer = buffer;
    if (file.type === 'image/svg+xml') {
      const svgText = buffer.toString('utf8');
      // Remove script tags, event handler attributes, and javascript: hrefs
      const sanitized = svgText
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
        .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
        .replace(/xlink:href\s*=\s*["']javascript:[^"']*["']/gi, '');
      uploadBuffer = Buffer.from(sanitized, 'utf8');
    }
    const result = await uploadFile(uploadBuffer, {
      fileName: file.name,
      mimeType: file.type,
      size: uploadBuffer.length,
    });

    console.log("[Upload] Upload successful:", result.url);

    const mediaRecord = await prisma.media.create({
      data: {
        url: result.url,
        mimeType: result.mimeType,
        filePath: result.publicId,
        width: result.width,
        height: result.height,
        fileSize: result.size,
      },
    });

    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Media",
        entityId: mediaRecord.id,
        newValues: toAuditJson(result),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    return created(c, { ...result, id: mediaRecord.id });
  })

  .post("/batch", async (c) => {

    const formData = await c.req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return badRequest(c, "No files provided");
    }

    if (files.length > MAX_BATCH_FILES) {
      return badRequest(c, `Too many files. Maximum allowed is ${MAX_BATCH_FILES}.`);
    }

    const results: { id: string; url: string; publicId: string; mimeType: string; size: number; width?: number; height?: number }[] = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push({ fileName: file.name, error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
        continue;
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push({ fileName: file.name, error: "File type not allowed" });
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadFile(buffer, {
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        });

        const mediaRecord = await prisma.media.create({
          data: {
            url: result.url,
            mimeType: result.mimeType,
            filePath: result.publicId,
            width: result.width,
            height: result.height,
            fileSize: result.size,
          },
        });

        results.push({ ...result, id: mediaRecord.id });
      } catch (err) {
        errors.push({
          fileName: file.name,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    for (const result of results) {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entityType: "Media",
          entityId: result.id,
          newValues: toAuditJson(result),
          ipAddress,
          userAgent,
          createdById: userId,
        },
      });
    }

    return created(c, { results, errors });
  })

  .delete("/:id", async (c) => {

    const id = c.req.param("id");

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Media not found");
    }

    try {
      if (existing.filePath) {
        await deleteMedia(existing.filePath);
      }
    } catch (err) {
      console.error("[Upload] Failed to delete from provider:", err);
    }

    await prisma.media.delete({ where: { id } });

    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Media",
        entityId: id,
        oldValues: toAuditJson(existing),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    return ok(c, { id });
  });

export default upload;
