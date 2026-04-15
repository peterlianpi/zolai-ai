"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicStatusPageProps {
  code: string;
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function PublicStatusPage({
  code,
  title,
  description,
  retryLabel = "Try Again",
  onRetry,
}: PublicStatusPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="space-y-6">
        <h1 className="text-9xl font-bold text-muted-foreground/20">{code}</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-md text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="ghost" onClick={onRetry ?? (() => router.refresh())}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
