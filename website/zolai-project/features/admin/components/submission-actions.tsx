"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { client } from "@/lib/api/client";

export function SubmissionActions({ id }: { id: string }) {
  const router = useRouter();

  async function act(action: "approve" | "reject") {
    const res = await client.api["content-submission"].submissions[":id"][action].$post({ param: { id } });
    if (res.ok) { toast.success(action === "approve" ? "Approved!" : "Rejected"); router.refresh(); }
    else toast.error("Action failed");
  }

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" className="h-7 gap-1 text-green-600 border-green-200" onClick={() => act("approve")}>
        <CheckCircle2 className="w-3.5 h-3.5" />Approve
      </Button>
      <Button size="sm" variant="outline" className="h-7 gap-1 text-destructive border-destructive/20" onClick={() => act("reject")}>
        <XCircle className="w-3.5 h-3.5" />Reject
      </Button>
    </div>
  );
}
