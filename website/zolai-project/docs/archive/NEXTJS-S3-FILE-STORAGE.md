# Next.js Starter Project - S3 Bucket File Storage Guide

**Version:** 1.0.0  
**Created:** 2026-04-09  
**Storage:** AWS S3, S3-compatible services
**Use Cases:** User avatars, post images, media uploads, documents

---

## Table of Contents

1. [Overview & Providers](#overview--providers)
2. [AWS S3 Setup](#aws-s3-setup)
3. [S3-Compatible Services](#s3-compatible-services)
4. [File Upload Implementation](#file-upload-implementation)
5. [Server-Side Upload Handler](#server-side-upload-handler)
6. [Client-Side Upload](#client-side-upload)
7. [File Management](#file-management)
8. [CDN & Optimization](#cdn--optimization)
9. [Security & Permissions](#security--permissions)
10. [Troubleshooting](#troubleshooting)

---

## Overview & Providers

### File Storage Options

| Provider | Type | Cost | Best For |
|----------|------|------|----------|
| **AWS S3** | Object storage | Pay-as-you-go | Enterprise, scalability |
| **Vercel Blob** | Serverless storage | $0.50/GB | Vercel deployments, simplicity |
| **Supabase Storage** | S3-compatible | Included tier | PostgreSQL users, integration |
| **MinIO** | Self-hosted S3 | Free/open-source | On-premise, control |
| **DigitalOcean Spaces** | S3-compatible | $5/month | Simple, affordable |
| **Cloudinary** | CDN + transform | Free tier | Image optimization, CDN |

### Recommendation

**For most projects:** **AWS S3** (most features, pricing, ecosystem)  
**For Vercel projects:** **Vercel Blob** (seamless integration)  
**For simplicity:** **DigitalOcean Spaces** (S3-compatible, cheaper)  
**For image focus:** **Cloudinary** (auto-optimization, CDN)

---

## AWS S3 Setup

### Step 1: Create AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create AWS Account"
3. Set up billing
4. Enable MFA (security best practice)

### Step 2: Create S3 Bucket

```bash
# Using AWS CLI
aws s3api create-bucket \
  --bucket starter-nextjs-prod \
  --region us-east-1

# Or use AWS Console
# 1. S3 → Create bucket
# 2. Name: starter-nextjs-prod
# 3. Region: us-east-1
# 4. Block public access: Enable
```

### Step 3: Create IAM User

**In AWS Console:**

1. Go to IAM → Users
2. Click "Create user"
3. Name: `nextjs-s3-user`
4. Attach policy: `AmazonS3FullAccess` (or custom policy below)

**Custom Policy (Recommended - More Secure):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::starter-nextjs-prod/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::starter-nextjs-prod"
    }
  ]
}
```

### Step 4: Create Access Keys

**In AWS Console:**

1. IAM → Users → Select `nextjs-s3-user`
2. Security credentials → Create access key
3. Save:
   - Access Key ID
   - Secret Access Key

### Step 5: Configure Environment Variables

**File:** `.env.local`

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=starter-nextjs-prod
AWS_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com

# File upload configuration
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB in bytes
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### Step 6: Configure CORS (If Client-Side Upload)

**In AWS S3 Console:**

1. Select bucket → Permissions → CORS
2. Add configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 7: Create Bucket Folders (Optional)

```bash
# Create logical folders in S3
aws s3api put-object \
  --bucket starter-nextjs-prod \
  --key avatars/ \
  --content-length 0

aws s3api put-object \
  --bucket starter-nextjs-prod \
  --key posts/ \
  --content-length 0

aws s3api put-object \
  --bucket starter-nextjs-prod \
  --key documents/ \
  --content-length 0
```

---

## S3-Compatible Services

### DigitalOcean Spaces (Recommended Alternative)

**Setup:**

```bash
# 1. Create Space in DigitalOcean console
# 2. Get credentials from Settings

# Environment variables
AWS_S3_BUCKET=my-space-name
AWS_REGION=nyc3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

**Cost:** $5/month for 250GB (vs S3 pay-as-you-go)

### MinIO (Self-Hosted)

```bash
# Docker installation
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Access at http://localhost:9001
# Create bucket and user in console

# Environment variables
AWS_S3_BUCKET=mybucket
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_ENDPOINT=http://localhost:9000
```

### Vercel Blob (Vercel Projects Only)

```bash
# If using Vercel, simple alternative:
npm install @vercel/blob

# Environment variables auto-created
# No manual setup needed!
```

---

## File Upload Implementation

### Install Dependencies

```bash
bun add aws-sdk
# or
bun add @aws-sdk/client-s3
```

### Create S3 Client

**File:** `lib/s3.ts`

```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload file to S3
 */
export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "uploads"
) {
  const key = `${folder}/${Date.now()}-${fileName}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: fileBuffer,
        ContentType: getMimeType(fileName),
        // Enable public read access (optional)
        ACL: "public-read",
      })
    );

    // Return public URL
    return `${process.env.AWS_S3_ENDPOINT}/${process.env.AWS_S3_BUCKET}/${key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("File upload failed");
  }
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(fileUrl: string) {
  try {
    // Extract key from URL
    const urlParts = fileUrl.split("/");
    const key = urlParts.slice(-2).join("/");

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
    );

    return true;
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error("File deletion failed");
  }
}

/**
 * Get signed URL (for private files with expiration)
 */
export async function getSignedDownloadUrl(fileUrl: string, expiresIn = 3600) {
  try {
    const key = fileUrl.split("/").slice(-2).join("/");

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
      { expiresIn }
    );

    return url;
  } catch (error) {
    console.error("Signed URL error:", error);
    throw new Error("Failed to generate signed URL");
  }
}

/**
 * Check if file exists in S3
 */
export async function fileExistsInS3(fileUrl: string) {
  try {
    const key = fileUrl.split("/").slice(-2).join("/");

    await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
    );

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get MIME type from filename
 */
function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

export { s3Client };
```

---

## Server-Side Upload Handler

### API Route for File Upload

**File:** `app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/s3";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const fileUrl = await uploadFileToS3(
      buffer,
      file.name,
      `${folder}/${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 }
      );
    }

    // Verify user owns the file
    if (!url.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete from S3
    await deleteFileFromS3(url);

    return NextResponse.json({
      success: true,
      message: "File deleted",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Deletion failed" },
      { status: 500 }
    );
  }
}
```

---

## Client-Side Upload

### File Upload Component

**File:** `features/upload/components/FileUploader.tsx`

```typescript
"use client";

import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploaderProps {
  onSuccess: (fileUrl: string) => void;
  folder?: string;
  maxSize?: number;
}

export function FileUploader({
  onSuccess,
  folder = "uploads",
  maxSize = 5 * 1024 * 1024,
}: FileUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large (max ${maxSize / 1024 / 1024}MB)`);
      return;
    }

    // Show preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Upload file
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { data } = await response.json();
      toast.success("File uploaded successfully");
      onSuccess(data.url);
    } catch (error) {
      toast.error("Upload failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!preview) return;

    setLoading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: preview }),
      });

      if (!response.ok) throw new Error("Delete failed");

      toast.success("File deleted");
      setPreview(null);
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
        <div className="text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={loading}
          accept="image/*"
        />
      </label>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg"
          />
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Usage in Forms

```typescript
import { FileUploader } from "@/features/upload/components/FileUploader";

export function UpdateProfileForm() {
  const [avatar, setAvatar] = useState("");

  return (
    <form>
      <FileUploader
        folder="avatars"
        onSuccess={(url) => {
          setAvatar(url);
          toast.success("Avatar updated");
        }}
      />
      {/* Rest of form */}
    </form>
  );
}
```

---

## File Management

### Store File URLs in Database

**Update Prisma Schema:**

```prisma
model User {
  id        String   @id @default(cuid())
  avatar    String?  // URL to S3 file
  // ... other fields
}

model Post {
  id            String   @id @default(cuid())
  featuredImage String?  // URL to S3 file
  // ... other fields
}
```

### Database Operations

```typescript
import { prisma } from "@/lib/prisma";
import { deleteFileFromS3 } from "@/lib/s3";

// Update user avatar
export async function updateUserAvatar(userId: string, avatarUrl: string) {
  // Get old avatar to delete
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (user?.avatar) {
    await deleteFileFromS3(user.avatar);
  }

  // Update with new avatar
  return prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });
}

// Delete post and cleanup files
export async function deletePost(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { featuredImage: true },
  });

  if (post?.featuredImage) {
    await deleteFileFromS3(post.featuredImage);
  }

  return prisma.post.delete({
    where: { id: postId },
  });
}
```

---

## CDN & Optimization

### CloudFront CDN (AWS)

**Setup:**

1. AWS Console → CloudFront → Create distribution
2. Origin: Your S3 bucket
3. Default cache behavior:
   - TTL: 86400 (1 day)
   - Compress: On
   - Query strings: Off

**Environment:**
```bash
# Use CloudFront URL instead of S3
AWS_CLOUDFRONT_URL=https://d123456.cloudfront.net
```

**Update upload function:**
```typescript
export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "uploads"
) {
  const key = `${folder}/${Date.now()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileBuffer,
      ContentType: getMimeType(fileName),
      ACL: "public-read",
      // Cache headers
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  // Use CloudFront URL
  const cdnUrl = process.env.AWS_CLOUDFRONT_URL || process.env.AWS_S3_ENDPOINT;
  return `${cdnUrl}/${process.env.AWS_S3_BUCKET}/${key}`;
}
```

### Image Optimization with Next.js

```typescript
import Image from "next/image";

export function UserAvatar({ user }: { user: User }) {
  return (
    <Image
      src={user.avatar || "/default-avatar.png"}
      alt={user.name}
      width={100}
      height={100}
      className="rounded-full"
      priority
    />
  );
}
```

### CloudFlare Workers (Alternative CDN)

```javascript
// wrangler.toml
[[env.production.routes]]
pattern = "cdn.example.com/*"
zone_name = "example.com"

// src/index.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cacheKey = new Request(url, { method: "GET" });
    const cache = caches.default;

    let response = await cache.match(cacheKey);
    if (!response) {
      // Forward to S3
      response = await fetch(
        `https://starter-nextjs-prod.s3.amazonaws.com${url.pathname}`
      );
      // Cache for 24 hours
      response = new Response(response.body, response);
      response.headers.set("Cache-Control", "public, max-age=86400");
      await cache.put(cacheKey, response.clone());
    }
    return response;
  },
};
```

---

## Security & Permissions

### Private File Access

```typescript
// For sensitive files (only user can access their own)
export async function getPrivateFileUrl(fileUrl: string, userId: string) {
  // Verify file ownership
  if (!fileUrl.includes(userId)) {
    throw new Error("Unauthorized");
  }

  // Generate signed URL (expires in 1 hour)
  return getSignedDownloadUrl(fileUrl, 3600);
}
```

### Server-Side Validation

```typescript
// Always validate on server
export async function validateFileOwnership(
  fileUrl: string,
  userId: string
) {
  // Check database for file ownership
  const file = await prisma.post.findFirst({
    where: {
      featuredImage: fileUrl,
      authorId: userId,
    },
  });

  return !!file;
}
```

### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::starter-nextjs-prod/*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::starter-nextjs-prod/*"
    }
  ]
}
```

---

## Troubleshooting

### Upload Fails

```typescript
// Check credentials
try {
  await s3Client.send(
    new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET! })
  );
  console.log("✓ S3 connection successful");
} catch (error) {
  console.error("✗ S3 connection failed:", error);
}
```

### CORS Issues

```bash
# Verify CORS configuration
aws s3api get-bucket-cors --bucket starter-nextjs-prod

# Update if needed
aws s3api put-bucket-cors \
  --bucket starter-nextjs-prod \
  --cors-configuration file://cors.json
```

### File Not Found

```typescript
// Check file exists
const exists = await fileExistsInS3(fileUrl);
console.log(exists ? "✓ File exists" : "✗ File not found");
```

---

## Cost Optimization

### Tips to Reduce S3 Costs

1. **Delete old files**
   ```typescript
   // Cleanup old avatars after 30 days
   const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
   // List and delete
   ```

2. **Use S3 Lifecycle Policies**
   ```json
   {
     "Rules": [
       {
        "Id": "DeleteOldFiles",
         "Status": "Enabled",
         "Prefix": "temp/",
         "Expiration": { "Days": 7 }
       }
     ]
   }
   ```

3. **Enable compression**
   - Already handled in PutObjectCommand

4. **Use appropriate storage class**
   - Standard for frequent access
   - Intelligent-Tiering for variable access

### Monthly Cost Estimate

- **Small app** (100 users, 1GB storage): ~$0.50
- **Medium app** (10K users, 50GB): ~$1.50
- **Large app** (100K users, 500GB): ~$15

---

## Summary

This guide provides:
- ✅ AWS S3 setup and configuration
- ✅ S3-compatible alternatives (DigitalOcean, MinIO)
- ✅ Complete upload implementation
- ✅ Server & client-side handlers
- ✅ CDN integration (CloudFront)
- ✅ Security and permissions
- ✅ Cost optimization
- ✅ Troubleshooting solutions

**You're now ready to handle file uploads like a pro!**
