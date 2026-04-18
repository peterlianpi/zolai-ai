"use client";
import { Button } from "@/components/ui/button";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 text-sm">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={reset} size="sm">Try again</Button>
    </div>
  );
}
