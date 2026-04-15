"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

interface RedirectFormProps {
  initialData?: {
    id: string;
    source: string;
    destination: string;
    statusCode: number;
    enabled: boolean;
  };
  isEdit?: boolean;
}

export function RedirectForm({ initialData, isEdit }: RedirectFormProps) {
  const router = useRouter();
  const [source, setSource] = useState(initialData?.source || "");
  const [destination, setDestination] = useState(initialData?.destination || "");
  const [statusCode, setStatusCode] = useState(String(initialData?.statusCode || 301));
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) {
      toast.error("Source and destination are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        source: source.trim(),
        destination: destination.trim(),
        statusCode: parseInt(statusCode, 10),
        enabled,
      };

      if (isEdit && initialData?.id) {
        const res = await client.api.redirects[":id"].$patch({
          param: { id: initialData.id },
          json: body,
        });
        if (!res.ok) throw new Error("Failed to update redirect");
        toast.success("Redirect updated successfully");
      } else {
        const res = await client.api.redirects.$post({ json: body });
        if (!res.ok) throw new Error("Failed to create redirect");
        toast.success("Redirect created successfully");
      }

      router.push("/admin/redirects");
      router.refresh();
    } catch {
      toast.error(isEdit ? "Failed to update redirect" : "Failed to create redirect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/redirects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit Redirect" : "Add Redirect"}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? "Update redirect settings" : "Create a new URL redirect"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 rounded-xl bg-muted/50 p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="source">Source URL</Label>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="/old-page"
              required
            />
            <p className="text-xs text-muted-foreground">
              The URL path to redirect from. Supports <code className="bg-muted px-1 rounded">{"/*"}</code> for wildcards and <code className="bg-muted px-1 rounded">/regex/</code> patterns.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination URL</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="/new-page"
              required
            />
            <p className="text-xs text-muted-foreground">
              The URL path to redirect to. Use <code className="bg-muted px-1 rounded">$1</code>, <code className="bg-muted px-1 rounded">$2</code> for regex capture groups.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="statusCode">Status Code</Label>
            <Select value={statusCode} onValueChange={setStatusCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301 - Permanent</SelectItem>
                <SelectItem value="302">302 - Temporary</SelectItem>
                <SelectItem value="307">307 - Temporary (preserve method)</SelectItem>
                <SelectItem value="308">308 - Permanent (preserve method)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2 flex items-end pb-2">
            <div className="flex items-center gap-2">
              <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why is this redirect needed?"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? "Update Redirect" : "Create Redirect"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/redirects">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
