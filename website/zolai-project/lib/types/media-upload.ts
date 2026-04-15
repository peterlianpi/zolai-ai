export interface MediaUploadProviderConfig {
  provider: 'cloudinary' | 'r2' | 's3';
  maxFileSizeMB: number;
}

export interface CloudinaryConfig extends MediaUploadProviderConfig {
  provider: 'cloudinary';
  cloudName: string;
  uploadPreset: string;
  apiKey: string;
  apiSecret: string;
}

export interface R2Config extends MediaUploadProviderConfig {
  provider: 'r2';
  endpoint: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
}

export interface S3Config extends MediaUploadProviderConfig {
  provider: 's3';
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
}

export type MediaUploadConfig = CloudinaryConfig | R2Config | S3Config;

export interface R2ObjectMetadata {
  ETag?: string;
  ContentLength?: number;
  ContentType?: string;
  LastModified?: Date;
  Metadata?: Record<string, string>;
}

export interface R2UploadResult {
  url: string;
  key: string;
  bucket: string;
  etag: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}