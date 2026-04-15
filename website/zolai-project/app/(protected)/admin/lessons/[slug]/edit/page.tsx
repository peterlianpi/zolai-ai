"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

interface Plan { id: string; title: string; description: string; isActive: boolean; level: string; units: Unit[] }
interface Unit { id: string; title: string; lessons: Lesson[] }
interface Lesson { id: string; title: string; xpReward: number }

export default function EditLessonPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.api.lessons.plans[":slug"].$get({ param: { slug } })
      .then(r => r.json())
      .then(d => setPlan((d as { data: Plan }).data));
  }, [slug]);

  async function save() {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await client.api.admin.lessons.plans[":id"].$patch({
        param: { id: plan.id },
        json: { title: plan.title, description: plan.description, isActive: plan.isActive },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Saved");
      router.push("/admin/lessons");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  }

  if (!plan) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit: {plan.level} — {plan.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <Input value={plan.title} onChange={e => setPlan(p => p ? { ...p, title: e.target.value } : p)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <Input value={plan.description} onChange={e => setPlan(p => p ? { ...p, description: e.target.value } : p)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" checked={plan.isActive}
            onChange={e => setPlan(p => p ? { ...p, isActive: e.target.checked } : p)} />
          <label htmlFor="active" className="text-sm">Active (visible to learners)</label>
        </div>
        <div className="space-y-2 pt-2">
          <h2 className="text-base font-semibold">Units & Lessons</h2>
          {plan.units.map(unit => (
            <div key={unit.id} className="border rounded-lg p-3 space-y-1">
              <p className="font-medium text-sm">{unit.title}</p>
              <div className="flex flex-wrap gap-1">
                {unit.lessons.map(l => (
                  <span key={l.id} className="text-xs px-2 py-0.5 rounded bg-muted">{l.title} ({l.xpReward}xp)</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
