"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { client } from "@/lib/api/client";

export function NewRunForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    await client.api.zolai.training.$post({
      json: { name: fd.get("name") as string, model: fd.get("model") as string, notes: fd.get("notes") as string | undefined },
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) return <Button size="sm" onClick={() => setOpen(true)}>+ New Run</Button>;

  return (
    <form onSubmit={submit} className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name">Run Name</Label>
          <Input id="name" name="name" placeholder="zolai-v9-lora" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="model">Base Model</Label>
          <Input id="model" name="model" placeholder="Qwen2.5-7B" required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Optional notes…" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>{loading ? "Creating…" : "Create"}</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
