"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, FileText, Film, Music } from "lucide-react";
import { useUploadMedia } from "@/features/media/hooks";
import type { UploadedMedia } from "@/features/media/types";

type UploadedFile = UploadedMedia;

interface UploadZoneProps {
  onUpload?: (files: UploadedFile[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({
  onUpload,
  multiple = false,
  accept,
  maxSizeMB = 5,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const maxSize = maxSizeMB * 1024 * 1024;
      const fileArray = Array.from(files);

      const oversized = fileArray.find((f) => f.size > maxSize);
      if (oversized) {
        setError(`File "${oversized.name}" exceeds the maximum size of ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        const results: UploadedFile[] = [];

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const uploaded = await uploadMedia.mutateAsync(file);
          results.push(uploaded);
          setProgress(((i + 1) / fileArray.length) * 100);
        }

        setUploadedFiles((prev) => [...prev, ...results]);
        onUpload?.(results);
        toast.success(`${results.length} file${results.length > 1 ? "s" : ""} uploaded`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        if (!uploadMedia.isError) {
          toast.error(message);
        }
      } finally {
        setUploading(false);
        setProgress(0);
        // Reset file input to allow re-selecting the same file
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [maxSizeMB, onUpload, uploadMedia],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleUpload(e.target.files);
      }
    },
    [handleUpload],
  );

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to browse (max {maxSizeMB}MB)
        </p>

        {uploading && (
          <div className="mt-4 w-full max-w-xs">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Uploading... {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {uploadedFiles.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div
                key={file.id}
                className="group relative overflow-hidden rounded-lg border"
              >
                {file.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt="Uploaded"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-muted">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                    <p className="truncate text-xs text-white" title={file.publicId}>
                      {file.publicId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="mt-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
