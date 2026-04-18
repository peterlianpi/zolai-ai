"use client";

import React, { useRef, use } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Plus, MoreHorizontal, FileText, Newspaper, File, Tag, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { InfiniteTable } from "@/features/admin/components/infinite-table";
import { client } from "@/lib/api/client";
import type { AdminPost, AdminPostsParams } from "@/lib/api/types";
import { useTablePagination } from "@/features/settings/hooks/use-table-pagination";
import { TablePaginationToggle } from "@/features/admin/components/table-pagination-toggle";
import { ContentFilters } from "@/features/content/components/content-filters";
import { useDeletePost } from "@/features/admin/hooks/use-admin-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { publicPostPath } from "@/lib/content-paths";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    PENDING: "outline",
    PUBLISHED: "default",
    TRASH: "destructive",
  };

  return <Badge variant={variants[status] || "outline"} title={`Status: ${status}`}>{status}</Badge>;
}

function TypeBadge({ type }: { type: string }) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    POST: "default",
    PAGE: "secondary",
    NEWS: "outline",
  };

  return <Badge variant={variants[type] || "outline"} className="text-xs" title={`Type: ${type}`}>{type}</Badge>;
}

export default function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    status?: string;
    locale?: string;
    search?: string;
    orderBy?: string;
    orderDir?: string;
  }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const router = useRouter();
  const pathname = usePathname();
  const { tablePagination, isLoading: isPrefsLoading } = useTablePagination();
  const [normalPage, setNormalPage] = React.useState(1);
  const loadingRef = useRef<HTMLDivElement>(null);
  const deletePost = useDeletePost();
  const [deleteTarget, setDeleteTarget] = React.useState<AdminPost | null>(null);

  const type = resolvedSearchParams.type || "ALL";
  const status = resolvedSearchParams.status || "ALL";
  const locale = resolvedSearchParams.locale || "ALL";
  const search = resolvedSearchParams.search || "";
  const orderBy = (resolvedSearchParams.orderBy || "createdAt") as NonNullable<AdminPostsParams["orderBy"]>;
  const orderDir = (resolvedSearchParams.orderDir || "desc") as NonNullable<AdminPostsParams["orderDir"]>;

  const setSort = (nextOrderBy: string) => {
    const current = new URLSearchParams();
    if (type && type !== "ALL") current.set("type", type);
    if (status && status !== "ALL") current.set("status", status);
    if (locale && locale !== "ALL") current.set("locale", locale);
    if (search) current.set("search", search);

    const nextOrderDir =
      orderBy === nextOrderBy ? (orderDir === "asc" ? "desc" : "asc") : "desc";

    current.set("orderBy", nextOrderBy);
    current.set("orderDir", nextOrderDir);
    current.set("page", "1");
    router.push(`${pathname}?${current.toString()}`);
  };

  const typeLabel =
    type === "POST" ? "Posts" :
    type === "NEWS" ? "News" :
    type === "PAGE" ? "Pages" :
    "All Resources";

  const createLabel =
    type === "POST" ? "Create Post" :
    type === "NEWS" ? "Create Article" :
    type === "PAGE" ? "Create Page" :
    "Create Resource";

  const createHref =
    type === "ALL"
      ? "/admin/content/resources/new"
      : `/admin/content/resources/new?type=${encodeURIComponent(type)}`;

  const handleDelete = (post: AdminPost) => {
    setDeleteTarget(post);
  };

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    error: infiniteError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["admin-resources-infinite", type, status, locale, search, orderBy, orderDir],
    queryFn: async ({ pageParam = 1 }) => {
      const q: Record<string, string> = { page: String(pageParam), limit: "20" };
      if (search) q.search = search;
      if (type && type !== "ALL") q.type = type;
      if (status && status !== "ALL") q.status = status;
      if (locale && locale !== "ALL") q.locale = locale;
      if (orderBy) q.orderBy = orderBy;
      if (orderDir) q.orderDir = orderDir;
      const res = await client.api.admin.posts.$get({ query: q });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      const typedPage = lastPage as { data: unknown[]; meta: { page: number; totalPages: number } };
      const meta = typedPage?.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !isPrefsLoading,
  });

  const {
    data: normalData,
    isLoading: isNormalLoading,
    error: normalError,
  } = useQuery({
    queryKey: ["admin-resources-normal", type, status, locale, search, orderBy, orderDir, normalPage],
    queryFn: async () => {
      const q: Record<string, string> = { page: String(normalPage), limit: "20" };
      if (search) q.search = search;
      if (type && type !== "ALL") q.type = type;
      if (status && status !== "ALL") q.status = status;
      if (locale && locale !== "ALL") q.locale = locale;
      if (orderBy) q.orderBy = orderBy;
      if (orderDir) q.orderDir = orderDir;
      const res = await client.api.admin.posts.$get({ query: q });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !isPrefsLoading,
  });

  const posts = (tablePagination === "infinite"
    ? infiniteData?.pages.flatMap((page) => (page as unknown as { data: AdminPost[] })?.data ?? []) ?? []
    : (normalData as unknown as { data: AdminPost[] })?.data ?? []) as AdminPost[];

  const error = infiniteError || normalError;
  const isLoading = isPrefsLoading || (tablePagination === "infinite" ? isInfiniteLoading : isNormalLoading);
  const showInfinite = !isPrefsLoading && tablePagination === "infinite";

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Failed to load resources</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{typeLabel}</h2>
          <p className="text-muted-foreground">
            {type === "ALL"
              ? "Manage all posts, news, and pages"
              : `Manage ${typeLabel.toLowerCase()}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TablePaginationToggle />
          <Button asChild>
            <Link href={createHref}>
              <Plus className="h-4 w-4 mr-2" />
              {createLabel}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <div className="p-6">
          {type === "ALL" && (
            <div className="grid gap-3 mb-6 md:grid-cols-2 xl:grid-cols-3">
              <QuickActionCard
                title="Posts"
                description="Create and manage posts"
                href="/admin/content/resources?type=POST"
                icon={FileText}
              />
              <QuickActionCard
                title="News"
                description="Create and manage news"
                href="/admin/content/resources?type=NEWS"
                icon={Newspaper}
              />
              <QuickActionCard
                title="Pages"
                description="Create and manage pages"
                href="/admin/content/resources?type=PAGE"
                icon={File}
              />
              <QuickActionCard
                title="Terms"
                description="Manage categories and tags"
                href="/admin/content/terms"
                icon={Tag}
              />
            </div>
          )}
          <ContentFilters
            basePath="/admin/content/resources"
            params={{ type, status, locale, search, orderBy, orderDir }}
          />

          {isLoading && posts.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              {showInfinite ? (
                <div className="rounded-md border overflow-x-auto">
                  <InfiniteTable
                    columns={[
                      {
                        key: "title",
                        title: (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium"
                            onClick={() => setSort("title")}
                          >
                            Title
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        ),
                        className: "min-w-[200px] md:min-w-[300px] lg:min-w-[400px]",
                        render: (post: AdminPost) => (
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px] lg:max-w-[400px]" title={post.title}>{post.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px] lg:max-w-[400px]" title={`/${post.slug}`}>/{post.slug}</p>
                          </div>
                        ),
                      },
                      {
                        key: "type",
                        title: "Type",
                        className: "w-[80px]",
                        render: (post: AdminPost) => <TypeBadge type={post.type} />,
                      },
                      {
                        key: "status",
                        title: "Status",
                        className: "w-[100px]",
                        render: (post: AdminPost) => <StatusBadge status={post.status} />,
                      },
                      {
                        key: "locale",
                        title: "Locale",
                        className: "w-[80px]",
                        render: (post: AdminPost) => (
                          <span className="uppercase text-xs" title={`Locale: ${post.locale}`}>{post.locale}</span>
                        ),
                      },
                      {
                        key: "published",
                        title: (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium"
                            onClick={() => setSort("publishedAt")}
                          >
                            Published
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        ),
                        className: "w-[120px]",
                        render: (post: AdminPost) => (
                          <span className="whitespace-nowrap text-sm">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                          </span>
                        ),
                      },
                      {
                        key: "createdAt",
                        title: (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium"
                            onClick={() => setSort("createdAt")}
                          >
                            Created
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        ),
                        className: "w-[120px]",
                        render: (post: AdminPost) => (
                          <span className="whitespace-nowrap text-sm">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        ),
                      },
                      {
                        key: "actions",
                        title: "",
                        className: "w-[60px] text-right",
                        render: (post: AdminPost) => (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/content/resources/${post.id}/edit`}>Edit</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={publicPostPath(post.type, post.slug, post.locale)} target="_blank">View</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={() => handleDelete(post)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ),
                      },
                    ]}
                    data={posts}
                    isLoading={isFetchingNextPage}
                    hasMore={hasNextPage ?? false}
                    onLoadMore={fetchNextPage}
                    loadingRef={loadingRef}
                    rowKey="id"
                  />
                </div>
              ) : (
                <NormalPaginationTable
                  posts={posts}
                  data={normalData}
                  onPageChange={setNormalPage}
                  onDelete={handleDelete}
                  onSort={setSort}
                />
              )}

              {showInfinite && isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Skeleton className="h-4 w-32" />
                </div>
              )}

              {showInfinite && !hasNextPage && posts.length > 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No more resources to load
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No resources found</p>
              <p className="text-muted-foreground">
                {search || type !== "ALL" || status !== "ALL" || locale !== "ALL"
                  ? "Try adjusting your filters"
                  : "Create your first resource to get started"}
              </p>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deletePost.isPending}
        onConfirm={() =>
          deleteTarget &&
          deletePost.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
      />
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-lg border bg-background p-4 transition",
        "hover:border-primary/60 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold group-hover:text-primary">
            {title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="rounded-md bg-muted p-2 text-muted-foreground group-hover:text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function NormalPaginationTable({
  posts,
  data,
  onPageChange,
  onDelete,
  onSort,
}: {
  posts: AdminPost[];
  data?: unknown;
  onPageChange?: (page: number) => void;
  onDelete: (post: AdminPost) => void;
  onSort: (orderBy: string) => void;
}) {
  const meta = (data as { data?: { meta?: { page?: number; totalPages?: number; total?: number } } })?.data?.meta;
  const page = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const start = (page - 1) * 20 + 1;
  const end = Math.min(page * 20, total);

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableCaption className="sr-only">Resources list</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => onSort("title")}
                >
                  Title
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]">Type</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Locale</TableHead>
              <TableHead className="w-[120px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => onSort("publishedAt")}
                >
                  Published
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => onSort("createdAt")}
                >
                  Created
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="w-[60px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-[200px] lg:max-w-[400px]" title={post.title}>{post.title}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px] lg:max-w-[400px]" title={`/${post.slug}`}>/{post.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <TypeBadge type={post.type} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={post.status} />
                </TableCell>
                <TableCell className="uppercase text-xs" title={`Locale: ${post.locale}`}>{post.locale}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
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
                        <Link href={`/admin/content/resources/${post.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={publicPostPath(post.type, post.slug, post.locale)} target="_blank">View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={() => onDelete(post)}
                      >
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
            {start}–{end} of {total}
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
