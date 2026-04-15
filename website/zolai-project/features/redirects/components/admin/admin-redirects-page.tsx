"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, ArrowRightLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InfiniteTable } from "@/features/admin/components/infinite-table";
import { useTablePagination } from "@/features/settings/hooks/use-table-pagination";
import { TablePaginationToggle } from "@/features/admin/components/table-pagination-toggle";
import {
  useRedirects,
  useInfiniteRedirects,
  useDeleteRedirectMutation,
} from "../../hooks/use-redirects";
import type { Redirect, RedirectListResponse } from "../../types";

export function AdminRedirectsPage() {
  const { tablePagination, isLoading: isPrefsLoading } = useTablePagination();
  const [enabledFilter, setEnabledFilter] = useState<boolean | undefined>(undefined);
  const [normalPage, setNormalPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Redirect | null>(null);
  const deleteRedirect = useDeleteRedirectMutation();
  const loadingRef = useRef<HTMLDivElement>(null);

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    error: infiniteError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteRedirects({
    enabled: enabledFilter,
    limit: 20,
  });

  const {
    data: normalData,
    isLoading: isNormalLoading,
    error: normalError,
  } = useRedirects({
    enabled: enabledFilter,
    page: normalPage,
    limit: 20,
  });

  const redirects = tablePagination === "infinite"
    ? infiniteData?.pages.flatMap((page) => page?.data?.redirects ?? []) ?? []
    : normalData?.data?.redirects ?? [];

  const error = infiniteError || normalError;
  const isLoading = isPrefsLoading || (tablePagination === "infinite" ? isInfiniteLoading : isNormalLoading);
  const showInfinite = !isPrefsLoading && tablePagination === "infinite";

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Failed to load redirects</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">URL Redirects</h2>
          <p className="text-muted-foreground">Manage URL redirections for legacy routes</p>
        </div>
        <div className="flex items-center gap-2">
          <TablePaginationToggle />
          <Button asChild>
            <Link href="/admin/redirects/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Redirect
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <div className="p-6">
          <div className="flex gap-3 mb-6">
            <Button variant={enabledFilter === undefined ? "outline" : "ghost"} size="sm" onClick={() => setEnabledFilter(undefined)}>
              All
            </Button>
            <Button variant={enabledFilter === true ? "outline" : "ghost"} size="sm" onClick={() => setEnabledFilter(true)}>
              Enabled
            </Button>
            <Button variant={enabledFilter === false ? "outline" : "ghost"} size="sm" onClick={() => setEnabledFilter(false)}>
              Disabled
            </Button>
          </div>

          {isLoading && redirects.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : redirects.length > 0 ? (
            <>
              {showInfinite ? (
                <div className="rounded-md border overflow-x-auto">
                  <InfiniteTable
                    columns={[
                      {
                        key: "source",
                        title: "Source",
                        className: "min-w-[150px] md:min-w-[200px] lg:min-w-[250px]",
                        render: (redirect: Redirect) => (
                          <code className="text-sm bg-muted px-2 py-1 rounded truncate block max-w-[150px] lg:max-w-[250px]" title={redirect.source}>
                            {redirect.source}
                          </code>
                        ),
                      },
                      {
                        key: "destination",
                        title: "Destination",
                        className: "min-w-[150px] md:min-w-[200px] lg:min-w-[250px]",
                        render: (redirect: Redirect) => (
                          <code className="text-sm bg-muted px-2 py-1 rounded truncate block max-w-[150px] lg:max-w-[250px]" title={redirect.destination}>
                            {redirect.destination}
                          </code>
                        ),
                      },
                      {
                        key: "statusCode",
                        title: "Status Code",
                        className: "w-[100px]",
                        render: (redirect: Redirect) => (
                          <Badge variant="outline" className="text-xs" title={`HTTP Status: ${redirect.statusCode}`}>{redirect.statusCode}</Badge>
                        ),
                      },
                      {
                        key: "enabled",
                        title: "Enabled",
                        className: "w-[100px]",
                        render: (redirect: Redirect) => (
                          <div className="flex items-center gap-2" title={`Redirect ${redirect.enabled ? "enabled" : "disabled"}`}>
                            <Switch checked={redirect.enabled} disabled />
                            <span className="text-sm hidden sm:inline">{redirect.enabled ? "Yes" : "No"}</span>
                          </div>
                        ),
                      },
                      {
                        key: "actions",
                        title: "",
                        className: "w-[60px] text-right",
                        render: (redirect: Redirect) => (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/redirects/${redirect.id}`}>Edit</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteTarget(redirect)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ),
                      },
                    ]}
                    data={redirects}
                    isLoading={isFetchingNextPage}
                    hasMore={hasNextPage ?? false}
                    onLoadMore={fetchNextPage}
                    loadingRef={loadingRef}
                    rowKey="id"
                  />
                </div>
              ) : (
                <NormalPaginationTable
                  redirects={redirects}
                  data={normalData}
                  onPageChange={setNormalPage}
                  onDelete={(redirect) => setDeleteTarget(redirect)}
                />
              )}

              {showInfinite && isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Skeleton className="h-4 w-32" />
                </div>
              )}

              {showInfinite && !hasNextPage && redirects.length > 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No more redirects to load
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No redirects found</p>
              <p className="text-muted-foreground">
                Add a redirect to route old URLs to new destinations
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Redirect"
        description="Are you sure you want to delete this redirect? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteRedirect.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteRedirect.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
      />
    </div>
  );
}

function NormalPaginationTable({
  redirects,
  data,
  onPageChange,
  onDelete,
}: {
  redirects: Redirect[];
  data?: RedirectListResponse;
  onPageChange?: (page: number) => void;
  onDelete?: (redirect: Redirect) => void;
}) {
  const meta = data?.data?.meta;
  const page = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const start = (page - 1) * 20 + 1;
  const end = Math.min(page * 20, total);

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableCaption className="sr-only">Redirects list</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Source</TableHead>
              <TableHead className="min-w-[150px]">Destination</TableHead>
              <TableHead className="w-[100px]">Status Code</TableHead>
              <TableHead className="w-[100px]">Enabled</TableHead>
              <TableHead className="w-[60px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redirects.map((redirect) => (
              <TableRow key={redirect.id}>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded truncate block max-w-[150px] lg:max-w-[250px]" title={redirect.source}>
                    {redirect.source}
                  </code>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded truncate block max-w-[150px] lg:max-w-[250px]" title={redirect.destination}>
                    {redirect.destination}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs" title={`HTTP Status: ${redirect.statusCode}`}>{redirect.statusCode}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2" title={`Redirect ${redirect.enabled ? "enabled" : "disabled"}`}>
                    <Switch checked={redirect.enabled} disabled />
                    <span className="text-sm hidden sm:inline">{redirect.enabled ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/redirects/${redirect.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete?.(redirect)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {total > 0 ? `${start}–${end} of ${total}` : "0 items"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
