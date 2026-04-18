# AWS S3 / R2 Upload Reference

**AWS SDK:** 3.1023.0 | **Cloudinary:** 2.9.0

## S3 Configuration

```ts
// lib/media/upload.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const isR2 = process.env.MEDIA_UPLOAD_PROVIDER === "r2";

const s3Client = new S3Client({
  region: isR2 ? "auto" : process.env.S3_REGION || "ap-southeast-1",
  endpoint: isR2 ? process.env.R2_ENDPOINT : undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: isR2, // true for R2, false for AWS S3
});

const BUCKET = isR2
  ? process.env.R2_BUCKET_NAME || ""
  : process.env.S3_BUCKET_NAME || "";
```

## Upload File

```ts
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadFile(
  buffer: Buffer,
  options: { fileName: string; mimeType: string; size: number }
): Promise<{ url: string; publicId: string; mimeType: string; size: number }> {
  const ext = options.fileName.split(".").pop() || "bin";
  const timestamp = Date.now();
  const random = crypto.randomUUID().slice(0, 8);
  const baseName = options.fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  const key = `images/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${baseName}-${timestamp}-${random}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: options.mimeType,
    ContentLength: options.size,
    ACL: "public-read", // AWS S3 only (R2 doesn't support ACL)
  });

  await s3Client.send(command);

  const baseUrl = isR2
    ? process.env.R2_PUBLIC_URL
    : `https://${BUCKET}.s3.${process.env.S3_REGION || "ap-southeast-1"}.amazonaws.com`;

  return {
    url: `${baseUrl}/${key}`,
    publicId: key,
    mimeType: options.mimeType,
    size: options.size,
  };
}
```

## Delete File

```ts
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}
```

## Bucket Configuration

### AWS S3
```
Bucket: zolai-assets
Region: ap-southeast-1
Public Access: Block OFF (for public reads)
CORS: Allow GET from your domain
```

### Cloudflare R2
```
Bucket: your-bucket
Region: auto (R2 uses auto)
Public Access: Enable via Custom Domain
CORS: Configure via R2 settings
```

## Environment Variables

```env
# S3 Configuration
MEDIA_UPLOAD_PROVIDER=s3
S3_REGION=ap-southeast-1
S3_BUCKET_NAME=zolai-assets
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_URL=https://zolai-assets.s3.ap-southeast-1.amazonaws.com

# R2 Configuration (alternative)
MEDIA_UPLOAD_PROVIDER=r2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=your-bucket
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_PUBLIC_URL=https://pub-xxxx.r2.dev

# Cloudinary (alternative)
MEDIA_UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## Upload API Endpoint

```ts
// app/api/[[...route]]/upload.ts
import { Hono } from "hono";
import { uploadFile } from "@/lib/media/upload";
import prisma from "@/lib/prisma";

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || "5") * 1024 * 1024;

const upload = new Hono()
  .post("/", async (c) => {
    const isAdmin = await checkIsAdmin(c);
    if (!isAdmin) return c.json({ error: "Unauthorized" }, 401);

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return c.json({ error: "No file provided" }, 400);
    if (file.size > MAX_FILE_SIZE) return c.json({ error: "File too large" }, 400);

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

    return c.json({ success: true, data: { ...result, id: mediaRecord.id } }, 201);
  });

export default upload;
```

## Next.js Image Config

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zolai-assets.s3.ap-southeast-1.amazonaws.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};
```

## Best Practices

1. **Use readable filenames** — slug-based with timestamp
2. **Organize by date** — `images/YYYY/MM/` structure
3. **Validate MIME types** — not just file extensions
4. **Enforce size limits** — prevent abuse
5. **Use `forcePathStyle` correctly** — `true` for R2, `false` for S3
6. **Public URL format** — match your bucket's access pattern
7. **Add to Next.js remotePatterns** — for image optimization
8. **Store metadata in Prisma** — track uploads in database
9. **Audit logging** — log all uploads and deletions
10. **CORS configuration** — allow your domain for direct uploads
