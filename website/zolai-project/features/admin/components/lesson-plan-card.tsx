"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import Link from "next/link";

interface Plan {
  id: string; slug: string; title: string; level: string; isActive: boolean;
  units: { id: string; title: string; lessons: { id: string; title: string }[] }[];
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-blue-100 text-blue-800", B2: "bg-indigo-100 text-indigo-800",
  C1: "bg-purple-100 text-purple-800", C2: "bg-rose-100 text-rose-800",
};

export function LessonPlanCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [active, setActive] = useState(plan.isActive);
  const [loading, setLoading] = useState(false);

  async function toggleActive(val: boolean) {
    setActive(val);
    const res = await client.api.admin.lessons[":id"].$patch({ param: { id: plan.id }, json: { isActive: val } });
    if (!res.ok) { setActive(!val); toast.error("Failed to update"); }
    else toast.success(val ? "Plan activated" : "Plan deactivated");
  }

  async function del() {
    if (!confirm(`Delete "${plan.title}"? This will delete all units and lessons.`)) return;
    setLoading(true);
    const res = await client.api.admin.lessons[":id"].$delete({ param: { id: plan.id } });
    if (res.ok) { toast.success("Deleted"); router.refresh(); }
    else toast.error("Delete failed");
    setLoading(false);
  }

  const totalLessons = plan.units.reduce((s, u) => s + u.lessons.length, 0);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[plan.level] ?? "bg-muted"}`}>{plan.level}</span>
            <h3 className="font-semibold text-sm truncate">{plan.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{plan.units.length} units · {totalLessons} lessons</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch checked={active} onCheckedChange={toggleActive} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={loading}><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link href={`/learn/${plan.slug}`}>Preview →</Link></DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={del}>Delete Plan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-1">
        {plan.units.map((unit, i) => (
          <div key={unit.id} className="pl-2 border-l-2 border-muted">
            <p className="text-xs font-medium">Ch.{i + 1} — {unit.title}</p>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {unit.lessons.slice(0, 5).map(l => (
                <span key={l.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{l.title}</span>
              ))}
              {unit.lessons.length > 5 && <span className="text-[10px] text-muted-foreground">+{unit.lessons.length - 5} more</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
