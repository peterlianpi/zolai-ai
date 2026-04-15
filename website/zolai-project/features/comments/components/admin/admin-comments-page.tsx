"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useTablePagination } from "@/features/settings/hooks/use-table-pagination";
import {
  useCommentStats,
  useComments,
  useCommentsInfinite,
  useUpdateCommentStatus,
  useBulkAction,
} from "@/features/comments/hooks/use-comments";
import type { Comment, BulkAction } from "@/features/comments/types";
import { TablePaginationToggle } from "@/features/admin/components/table-pagination-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X, Trash2, MessageCircle, Search, RotateCcw, Archive, User, ExternalLink } from "lucide-react";
import { publicPostPath } from "@/lib/content-paths";

export function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const { tablePagination } = useTablePagination();
  const isInfinite = tablePagination === "infinite";
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [bulkTarget, setBulkTarget] = useState<BulkAction | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const { data: stats } = useCommentStats();
  
  const { data: normalData, isLoading: isNormalLoading } = useComments({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
    page,
    limit: 20,
    enabled: !isInfinite,
  });

  const { 
    data: infiniteData, 
    isLoading: isInfiniteLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useCommentsInfinite({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
    limit: 20,
    enabled: isInfinite,
  });

  const updateStatus = useUpdateCommentStatus();
  const bulkAction = useBulkAction();

  const refreshCommentsData = () => {
    void queryClient.refetchQueries({ queryKey: ["comments"] });
    void queryClient.refetchQueries({ queryKey: ["comments-infinite"] });
    void queryClient.refetchQueries({ queryKey: ["comment-stats"] });
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!isInfinite || !hasNextPage || isFetchingNextPage || !loadMoreRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isInfinite, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const comments = isInfinite 
    ? (infiniteData?.pages.flatMap(page => page.comments) ?? []) 
    : (normalData?.comments ?? []);
    
  const total = isInfinite ? (infiniteData?.pages[0]?.total ?? 0) : (normalData?.total ?? 0);
  const hasMore = isInfinite ? hasNextPage : (normalData?.hasMore ?? false);
  const isLoading = isInfinite ? isInfiniteLoading : isNormalLoading;

  const handleApprove = (id: string) =>
    updateStatus.mutate(
      { id, status: "APPROVED" },
      {
        onSuccess: () => {
          toast.success("Approved");
          refreshCommentsData();
        },
      }
    );

  const handleSpam = (id: string) =>
    updateStatus.mutate(
      { id, status: "SPAM" },
      {
        onSuccess: () => {
          toast.success("Marked as spam");
          refreshCommentsData();
        },
      }
    );

  const handleDelete = (id: string) =>
    updateStatus.mutate(
      { id, status: "TRASH" },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          toast.success("Moved to trash");
          refreshCommentsData();
        },
      }
    );

  const allSelected = comments.length > 0 && comments.every(c => selectedIds.has(c.id));
  const someSelected = comments.some(c => selectedIds.has(c.id));

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(comments.map(c => c.id)));

  const handleBulk = (action: BulkAction) => {
    if (selectedIds.size === 0) { toast.warning("No comments selected"); return; }
    setBulkTarget(action);
  };

  const executeBulk = () => {
    if (!bulkTarget) return;
    bulkAction.mutate(
      { action: bulkTarget, ids: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setBulkTarget(null);
          refreshCommentsData();
        },
      }
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-0">
      <div>
        <h2 className="text-2xl font-bold">Comments</h2>
        <p className="text-muted-foreground">Manage and moderate user comments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats?.pending ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Approved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats?.approved ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Spam</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats?.spam ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Trash</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-muted-foreground">{stats?.trash ?? 0}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Comments</CardTitle><CardDescription>Filter, search and manage comments</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-2 flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery} 
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }} 
                  className="pl-10" 
                />
              </div>
            </div>
            <div className="grid gap-2 w-[180px]">
              <Label>Status</Label>
              <Select 
                value={statusFilter} 
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="SPAM">Spam</SelectItem>
                  <SelectItem value="TRASH">Trash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end"><TablePaginationToggle /></div>
          </div>

          {someSelected && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => handleBulk("APPROVED")} disabled={bulkAction.isPending}><Check className="h-4 w-4 mr-1" />Approve</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulk("SPAM")} disabled={bulkAction.isPending}><X className="h-4 w-4 mr-1" />Spam</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulk("TRASH")} disabled={bulkAction.isPending}><Archive className="h-4 w-4 mr-1" />Trash</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulk("DELETE")} disabled={bulkAction.isPending}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3 py-2" aria-busy="true" aria-live="polite">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`admin-comment-skeleton-${i}`} className="grid grid-cols-6 gap-3 rounded-lg border p-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No comments found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell><Checkbox checked={selectedIds.has(comment.id)} onCheckedChange={() => toggleSelect(comment.id)} /></TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-1 cursor-help">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{comment.authorName}</p>
                                <Badge variant={comment.author?.role ? "outline" : "secondary"} className="text-xs">
                                  {comment.author?.role || <><User className="h-3 w-3 mr-1" />Guest</>}
                                </Badge>
                              </div>
                              {comment.authorEmail && <p className="text-xs text-muted-foreground">{comment.authorEmail}</p>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="w-80">
                            <div className="space-y-2 text-sm">
                              <div className="font-semibold border-b pb-1">Commenter Info</div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground">Name:</span><span className="col-span-2 font-medium">{comment.authorName}</span>
                                <span className="text-muted-foreground">Email:</span><span className="col-span-2">{comment.authorEmail || "N/A"}</span>
                                <span className="text-muted-foreground">Role:</span><span className="col-span-2">{comment.author?.role || "Guest"}</span>
                                <span className="text-muted-foreground">IP:</span><span className="col-span-2 text-xs font-mono">{comment.authorIp || "N/A"}</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="truncate max-w-[300px] cursor-help">{comment.content}</p>
                          </TooltipTrigger>
                          <TooltipContent className="w-96 max-h-64 overflow-y-auto">
                            <p className="whitespace-pre-wrap">{comment.content}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant={comment.status === "APPROVED" ? "default" : comment.status === "PENDING" ? "secondary" : comment.status === "SPAM" ? "destructive" : "outline"}>
                        {comment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(comment.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {comment.status === "PENDING" && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleApprove(comment.id)} disabled={updateStatus.isPending} title="Approve"><Check className="h-4 w-4 text-green-600" /></Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleSpam(comment.id)} disabled={updateStatus.isPending} title="Spam"><X className="h-4 w-4 text-red-600" /></Button>
                          </>
                        )}
                        {comment.status === "SPAM" && <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleApprove(comment.id)} disabled={updateStatus.isPending} title="Not spam"><RotateCcw className="h-4 w-4 text-green-600" /></Button>}
                        {comment.status !== "TRASH" && <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setDeleteTarget(comment)} title="Trash"><Trash2 className="h-4 w-4" /></Button>}
                        {comment.status === "TRASH" && <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleApprove(comment.id)} disabled={updateStatus.isPending} title="Restore"><RotateCcw className="h-4 w-4 text-blue-600" /></Button>}
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setSelectedComment(comment)} title="Details"><ExternalLink className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                 {isInfinite && hasMore && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div ref={loadMoreRef} className="h-8"></div>
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!isInfinite && total > 20 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">Showing {comments.length} of {total}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!hasMore}>Next</Button>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Move to Trash" description="Are you sure?" confirmLabel="Move to Trash" destructive isLoading={updateStatus.isPending} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)} />
      <ConfirmDialog open={!!bulkTarget} onOpenChange={(open) => !open && setBulkTarget(null)} title="Bulk Action" description={bulkTarget === "DELETE" ? `Delete ${selectedIds.size} comments?` : `${bulkTarget?.toLowerCase()} ${selectedIds.size} comments?`} confirmLabel={bulkTarget === "DELETE" ? "Delete" : "Confirm"} destructive={bulkTarget === "DELETE"} isLoading={bulkAction.isPending} onConfirm={executeBulk} />

      <Dialog open={!!selectedComment} onOpenChange={(open) => !open && setSelectedComment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Comment Details</DialogTitle></DialogHeader>
          {selectedComment && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold border-b pb-1">Author</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span>{selectedComment.authorName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{selectedComment.authorEmail || "N/A"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Role:</span><Badge variant={selectedComment.author?.role ? "outline" : "secondary"}>{selectedComment.author?.role || "Guest"}</Badge></div>
                    {selectedComment.authorIp && <div className="flex justify-between"><span className="text-muted-foreground">IP:</span><span className="font-mono text-xs">{selectedComment.authorIp}</span></div>}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold border-b pb-1">Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><Badge>{selectedComment.status}</Badge></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Created:</span><span>{format(new Date(selectedComment.createdAt), "MMM d, yyyy 'at' h:mm a")}</span></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold border-b pb-1">Content</h4>
                <div className="p-4 bg-muted/30 rounded-lg"><p className="whitespace-pre-wrap">{selectedComment.content}</p></div>
              </div>
              {selectedComment.userAgent && (
                <div className="space-y-3">
                  <h4 className="font-semibold border-b pb-1">User Agent</h4>
                  <code className="text-xs p-2 bg-muted rounded break-all">{selectedComment.userAgent}</code>
                </div>
              )}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const href = selectedComment.post
                      ? publicPostPath(
                          selectedComment.post.type,
                          selectedComment.post.slug,
                          selectedComment.post.locale
                        )
                      : "/posts";
                    window.open(href, "_blank");
                    setSelectedComment(null);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />View Post
                </Button>
                {selectedComment.status === "PENDING" && (
                  <>
                    <Button variant="outline" onClick={() => { handleApprove(selectedComment.id); setSelectedComment(null); }} disabled={updateStatus.isPending}><Check className="h-4 w-4 mr-2" />Approve</Button>
                    <Button variant="outline" onClick={() => { handleSpam(selectedComment.id); setSelectedComment(null); }} disabled={updateStatus.isPending}><X className="h-4 w-4 mr-2" />Spam</Button>
                  </>
                )}
                {selectedComment.status !== "TRASH" && <Button variant="outline" onClick={() => { setDeleteTarget(selectedComment); setSelectedComment(null); }}><Trash2 className="h-4 w-4 mr-2" />Trash</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
