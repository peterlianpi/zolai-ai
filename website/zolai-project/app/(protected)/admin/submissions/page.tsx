import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { SubmissionActions } from "@/features/admin/components/submission-actions";

export default async function AdminSubmissionsPage() {
  const subs = await prisma.learningResource.findMany({
    where: { status: "REVIEW" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, resourceType: true, status: true, createdAt: true, author: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Content Submissions</h1>
        <p className="text-sm text-muted-foreground">{subs.length} pending review</p>
      </div>

      {subs.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No pending submissions.</p>
      ) : (
        <div className="space-y-3">
          {subs.map(s => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{s.author?.name} ({s.author?.email})</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">{s.resourceType}</Badge>
                    <SubmissionActions id={s.id} />
                  </div>
                </div>
              </CardHeader>
              {s.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
