"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import UploadZone from "@/features/media/components/upload-zone";
import { useMediaInfinite } from "@/features/media/hooks";

interface MediaBrowserProps {
  onSelect: (id: string, url: string, altText: string | null) => void;
  selectedId?: string | null;
}

export default function MediaBrowser({ onSelect, selectedId }: MediaBrowserProps) {
  const [search, setSearch] = useState("");
  const [mimeType, setMimeType] = useState<string>("ALL");

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useMediaInfinite({ limit: 20 });

  const media = data?.pages.flatMap((page) => page?.media ?? []) ?? [];

  const filteredMedia = media.filter((item) => {
    if (mimeType !== "ALL" && !item.mimeType.startsWith(mimeType === "image" ? "image/" : mimeType === "video" ? "video/" : "")) {
      return false;
    }
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        (item.altText?.toLowerCase().includes(searchLower) ?? false) ||
        (item.filePath?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <UploadZone
        onUpload={() => {
          refetch();
        }}
        multiple
      />

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          value={mimeType}
          onChange={(e) => setMimeType(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="ALL">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="other">Other</option>
        </select>
      </div>

      {isLoading && filteredMedia.length === 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : filteredMedia.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 max-h-[400px] overflow-y-auto">
            {filteredMedia.map((item) => {
              const isImage = item.mimeType.startsWith("image/");
              const isSelected = selectedId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "group relative overflow-hidden rounded-lg border transition-all hover:border-primary",
                    isSelected && "ring-2 ring-primary"
                  )}
                  onClick={() => onSelect(item.id, item.url, item.altText)}
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.altText || "Media"}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-muted">
                      <span className="text-xs text-muted-foreground">
                        {item.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                      </span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute right-1 top-1 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-[10px] text-white" title={item.altText ?? item.filePath ?? undefined}>
                      {item.altText || item.filePath}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">No media files found</p>
        </div>
      )}
    </div>
  );
}
