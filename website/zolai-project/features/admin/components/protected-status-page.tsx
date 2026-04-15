"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedStatusPageProps {
  code: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ProtectedStatusPage({
  code,
  title,
  description,
  primaryHref = "/dashboard",
  primaryLabel = "Go to Dashboard",
  retryLabel = "Try Again",
  onRetry,
}: ProtectedStatusPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="space-y-6">
          <h1 className="text-8xl font-bold text-muted-foreground/20">{code}</h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mx-auto max-w-md text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button asChild>
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button variant="ghost" onClick={onRetry ?? (() => router.refresh())}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {retryLabel}
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
