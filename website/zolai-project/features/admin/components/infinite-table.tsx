"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  title: React.ReactNode;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface InfiniteTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingRef?: React.RefObject<HTMLDivElement | null>;
  rowKey: keyof T;
  className?: string;
}

export function InfiniteTable<T>({
  columns,
  data,
  isLoading,
  hasMore,
  onLoadMore,
  loadingRef,
  rowKey,
  className,
}: InfiniteTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`max-h-[calc(100vh-300px)] overflow-auto ${className || ""}`}
    >
      <Table>
        <TableCaption className="sr-only">Users list</TableCaption>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)} className={cn(col.className, "whitespace-nowrap")}>
                {col.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={String(item[rowKey]) + index}>
              {columns.map((col) => (
                <TableCell key={String(col.key)} className={col.className}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[String(col.key)] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {isLoading && (
            <TableRow>
              {columns.map((col, i) => (
                <TableCell key={i} className={col.className}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          )}

          {!isLoading && data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div ref={loadingRef} className="h-4" />
    </div>
  );
}

export function TruncateText({
  text,
  className,
  maxLength = 50,
}: {
  text: string;
  className?: string;
  maxLength?: number;
}) {
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} title={text}>
      {text.slice(0, maxLength)}...
    </span>
  );
}
