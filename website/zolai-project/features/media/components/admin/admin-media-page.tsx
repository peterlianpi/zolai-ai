import Link from "next/link";
import { Image, Plus } from "lucide-react";
import type { MediaWhereInput } from "@/lib/generated/prisma/models";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PAGE_SIZE = 20;

interface AdminMediaPageProps {
  searchParams: Promise<{
    page?: string;
    mimeType?: string;
  }>;
}

async function getMedia(params: { page?: string; mimeType?: string }) {
  const page = Number.parseInt(params.page || "1", 10);
  const skip = (page - 1) * PAGE_SIZE;

  const where: MediaWhereInput = {};
  if (params.mimeType && params.mimeType !== "ALL") {
    where.mimeType = { contains: params.mimeType };
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.media.count({ where }),
  ]);

  return {
    media,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  const params = await searchParams;
  const { media, total, page, totalPages } = await getMedia(params);

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">Manage images and files</p>
        </div>
        <Button asChild>
          <Link href="/admin/media/upload"><Plus className="mr-2 h-4 w-4" />Upload</Link>
        </Button>
      </div>

      <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <div className="p-6">
          <div className="mb-6 flex gap-3">
            <Button variant="outline" size="sm" asChild><Link href="/admin/media">All</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/media?mimeType=image">Images</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/media?mimeType=application">Documents</Link></Button>
          </div>

          {media.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Image className="mb-4 h-12 w-12 text-muted-foreground" role="img" aria-label="No media" />
              <p className="text-lg font-medium">No media found</p>
              <p className="text-muted-foreground">Upload your first file to get started</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {media.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex aspect-square items-center justify-center bg-muted">
                        {isImage(item.mimeType) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt={item.altText || "Media image"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Image className="mb-2 h-8 w-8" role="img" aria-label="File type" />
                            <span className="text-xs">{item.mimeType.split("/")[1]?.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-medium">{item.altText || item.url.split("/").pop()}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">{formatFileSize(item.fileSize)}</Badge>
                          {item.width && item.height && <span className="text-xs text-muted-foreground">{item.width}x{item.height}</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} files</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild disabled={page === 1}>
                      <Link href={`/admin/media${params.mimeType ? `?mimeType=${params.mimeType}&page=${page - 1}` : `?page=${page - 1}`}`}>Previous</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
                      <Link href={`/admin/media${params.mimeType ? `?mimeType=${params.mimeType}&page=${page + 1}` : `?page=${page + 1}`}`}>Next</Link>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
