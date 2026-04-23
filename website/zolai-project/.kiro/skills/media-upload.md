---
name: media-upload
description: Media upload and storage patterns — S3/R2, file validation, upload flow, MediaBrowser. Use when working on features/media or lib/media/upload.ts.
---

# Media Upload — Zolai Platform

## Storage providers (lib/media/upload.ts)

Supports Cloudinary, AWS S3, and Cloudflare R2 — provider selected via `MEDIA_UPLOAD_PROVIDER` env var.

```env
MEDIA_UPLOAD_PROVIDER=cloudinary   # or "s3" or "r2"

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_PRESET=...

# R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...
R2_PUBLIC_URL=...

# S3
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
S3_REGION=...
```

## Upload flow

```
Client → POST /api/media/upload → lib/media/upload.ts → S3/R2
                                        ↓
                              prisma.media.create (record)
                                        ↓
                              return { url, key, id }
```

## File validation

```ts
// Default max: 5MB (configurable via MAX_UPLOAD_SIZE_MB env var)
// Validate server-side in lib/media/upload.ts — uploadFile() throws if size exceeded
```

## Upload API

```ts
import { uploadFile, deleteMedia } from "@/lib/media/upload";

const result = await uploadFile(buffer, {
  fileName: "photo.jpg",
  mimeType: "image/jpeg",
  size: buffer.length,
});
// result: { url, publicId, mimeType, size, width?, height? }
```

## Client upload hook

```ts
// features/media/hooks/
import { useUpload } from "@/features/media/hooks/useUpload";

const { upload, isUploading, progress } = useUpload();
const result = await upload(file);
// result: { url, key, id }
```

## Media model fields

```ts
{ id, url, key, filename, mimeType, size, uploadedBy, createdAt }
```

## After upload

Always invalidate media query cache:
```ts
queryClient.invalidateQueries({ queryKey: ["media"] });
```
