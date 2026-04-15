import { v2 as cloudinary } from "cloudinary";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const PROVIDER = process.env.MEDIA_UPLOAD_PROVIDER || "cloudinary";
const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || "5") * 1024 * 1024;

let s3Client: S3Client | null = null;
let s3ClientConfigKey: string | null = null;

function getS3ConfigKey(): string {
  return PROVIDER === "r2"
    ? `${process.env.R2_ACCESS_KEY_ID}|${process.env.R2_SECRET_ACCESS_KEY}|${process.env.R2_ENDPOINT}`
    : `${process.env.S3_ACCESS_KEY_ID}|${process.env.S3_SECRET_ACCESS_KEY}|${process.env.S3_REGION}|${process.env.S3_ENDPOINT}`;
}

function getS3Client(): S3Client {
  const configKey = getS3ConfigKey();
  if (s3Client && s3ClientConfigKey === configKey) return s3Client;

  const accessKeyId = PROVIDER === "r2"
    ? (process.env.R2_ACCESS_KEY_ID || "")
    : (process.env.S3_ACCESS_KEY_ID || "");
  const secretAccessKey = PROVIDER === "r2"
    ? (process.env.R2_SECRET_ACCESS_KEY || "")
    : (process.env.S3_SECRET_ACCESS_KEY || "");

  if (!accessKeyId) {
    throw new Error(`${PROVIDER.toUpperCase()} access key is not configured`);
  }
  if (!secretAccessKey) {
    throw new Error(`${PROVIDER.toUpperCase()} secret key is not configured`);
  }

  s3Client = new S3Client({
    region: PROVIDER === "r2" ? "auto" : (process.env.S3_REGION || "ap-southeast-1"),
    endpoint: PROVIDER === "r2"
      ? process.env.R2_ENDPOINT
      : process.env.S3_ENDPOINT,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: PROVIDER === "r2",
  });
  s3ClientConfigKey = configKey;
  return s3Client;
}

function extractR2AccountId(): string {
  const endpoint = process.env.R2_ENDPOINT || "";
  const match = endpoint.match(/https?:\/\/([^.]+)\.r2\.cloudflarestorage\.com/);
  return match ? match[1] : "";
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  mimeType: string;
  size: number;
}

function buildStorageKey(fileName: string, mimeType: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "";
  const uuid = randomUUID().slice(0, 8);
  
  // Generate a slug-like filename: lowercase, replace spaces/special chars with hyphens
  const baseName = fileName.replace(/\.[^.]+$/, "") // Remove extension
    .toLowerCase()                                  // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '-')                    // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')                        // Remove leading/trailing hyphens
    .slice(0, 50)                                   // Limit length
    || 'file';                                      // Fallback if empty
  
  const prefix = mimeType.startsWith("image/") ? "images" : mimeType.startsWith("video/") ? "videos" : "files";
  return `${prefix}/${year}/${month}/${baseName}-${uuid}${ext ? `.${ext}` : ""}`;
}

export async function uploadFile(
  file: Buffer,
  options: {
    fileName: string;
    mimeType: string;
    size: number;
  },
): Promise<UploadResult> {
  if (options.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  switch (PROVIDER) {
    case "cloudinary":
      return uploadToCloudinary(file, options);
    case "r2":
    case "s3":
      return uploadToS3(file, options);
    default:
      throw new Error(`Unsupported media provider: ${PROVIDER}`);
  }
}

async function uploadToCloudinary(
  file: Buffer,
  options: { fileName: string; mimeType: string; size: number },
): Promise<UploadResult> {
  // Validate all required Cloudinary configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary configuration is missing: CLOUDINARY_CLOUD_NAME is required");
  }
  if (!process.env.CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing: CLOUDINARY_UPLOAD_PRESET is required");
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error("Cloudinary configuration is missing: CLOUDINARY_API_KEY is required");
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary configuration is missing: CLOUDINARY_API_SECRET is required");
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const base64File = `data:${options.mimeType};base64,${file.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64File, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      public_id: options.fileName.replace(/\.[^.]+$/, ""),
      resource_type: options.mimeType.startsWith("video/") ? "video" : "auto",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      mimeType: options.mimeType,
      size: options.size,
    };
    } catch (error) {
      // Enhance error with context for better debugging
      if (error instanceof Error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
      }
      throw new Error('Cloudinary upload failed: Unknown error');
    }
}

async function uploadToS3(
  file: Buffer,
  options: { fileName: string; mimeType: string; size: number },
): Promise<UploadResult> {
  const bucket = PROVIDER === "r2"
    ? process.env.R2_BUCKET_NAME
    : process.env.S3_BUCKET_NAME;

  if (!bucket) {
    throw new Error(`${PROVIDER.toUpperCase()} bucket name is not configured`);
  }

  const accessKeyId = PROVIDER === "r2"
    ? (process.env.R2_ACCESS_KEY_ID || "")
    : (process.env.S3_ACCESS_KEY_ID || "");
  const secretAccessKey = PROVIDER === "r2"
    ? (process.env.R2_SECRET_ACCESS_KEY || "")
    : (process.env.S3_SECRET_ACCESS_KEY || "");

  if (!accessKeyId) {
    throw new Error(`${PROVIDER.toUpperCase()} access key is not configured`);
  }
  if (!secretAccessKey) {
    throw new Error(`${PROVIDER.toUpperCase()} secret key is not configured`);
  }

  const key = buildStorageKey(options.fileName, options.mimeType);
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: options.mimeType,
      ContentLength: options.size,
    }),
  );

  const url = PROVIDER === "r2"
    ? `${process.env.R2_PUBLIC_URL || `https://${extractR2AccountId()}.r2.dev`}/${key}`
    : `${process.env.S3_PUBLIC_URL || `https://${bucket}.s3.${process.env.S3_REGION || "us-east-1"}.amazonaws.com`}/${key}`;

  return {
    url,
    publicId: key,
    mimeType: options.mimeType,
    size: options.size,
  };
}

export async function deleteMedia(publicId: string): Promise<void> {
  switch (PROVIDER) {
    case "cloudinary": {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      await cloudinary.uploader.destroy(publicId);
      break;
    }
    case "r2":
    case "s3": {
      const bucket = PROVIDER === "r2"
        ? process.env.R2_BUCKET_NAME
        : process.env.S3_BUCKET_NAME;
      if (!bucket) throw new Error("Bucket name is not configured");
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: publicId,
        }),
      );
      break;
    }
    default:
      throw new Error(`Unsupported media provider: ${PROVIDER}`);
  }
}

export function getMediaUrl(publicId: string): string {
  switch (PROVIDER) {
    case "cloudinary":
      return cloudinary.url(publicId, { secure: true });
    case "r2": {
      const publicUrl = process.env.R2_PUBLIC_URL || `https://${extractR2AccountId()}.r2.dev`;
      return `${publicUrl}/${publicId}`;
    }
    case "s3": {
      const bucket = process.env.S3_BUCKET_NAME || "";
      const region = process.env.S3_REGION || "us-east-1";
      const publicUrl = process.env.S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`;
      return `${publicUrl}/${publicId}`;
    }
    default:
      throw new Error(`Unsupported media provider: ${PROVIDER}`);
  }
}
