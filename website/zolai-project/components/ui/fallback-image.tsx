"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FallbackImageProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
}

export function FallbackImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  fallback,
  priority,
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-muted/40", className)}>
        {fallback}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={cn("object-cover", className)}
      priority={priority}
      onError={() => setError(true)}
      unoptimized={src.startsWith("http") && !src.includes("cloudinary")}
    />
  );
}
