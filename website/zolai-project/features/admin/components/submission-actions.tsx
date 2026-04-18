"use client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { client } from "@/lib/api/client";

export function SubmissionActions({ id }: { id: string }) {
  const router = useRouter();

  const approve = useMutation({
    mutationFn: () => client.api["content-submission"].submissions[":id"].approve.$post({ param: { id } }),
    onSuccess: () => { toast.success("Approved!"); router.refresh(); },
    onError: () => toast.error("Action failed"),
  });

  const reject = useMutation({
    mutationFn: () => client.api["content-submission"].submissions[":id"].reject.$post({ param: { id }, json: {} }),
    onSuccess: () => { toast.success("Rejected"); router.refresh(); },
    onError: () => toast.error("Action failed"),
  });

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" className="h-7 gap-1 text-green-600 border-green-200" onClick={() => approve.mutate()} disabled={approve.isPending}>
        <CheckCircle2 className="w-3.5 h-3.5" />Approve
      </Button>
      <Button size="sm" variant="outline" className="h-7 gap-1 text-destructive border-destructive/20" onClick={() => reject.mutate()} disabled={reject.isPending}>
        <XCircle className="w-3.5 h-3.5" />Reject
      </Button>
    </div>
  );
}
