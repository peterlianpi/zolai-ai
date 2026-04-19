"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContentFiltersProps {
  basePath: string;
  params: {
    type?: string;
    status?: string;
    locale?: string;
    search?: string;
    orderBy?: string;
    orderDir?: string;
  };
}

export function ContentFilters({ params }: ContentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(params.search || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateFilter = useCallback((key: string, value: string) => {
    const current = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "ALL") {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    current.set("page", "1");
    const query = current.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }, [router, pathname, searchParams]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilter("search", value);
    }, 400);
  }, [updateFilter]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Input
          placeholder="Search..."
          value={searchInput}
          onChange={handleSearchChange}
        />
      </div>
      <Select
        value={params.type || "ALL"}
        onValueChange={(v) => updateFilter("type", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="POST">Post</SelectItem>
          <SelectItem value="PAGE">Page</SelectItem>
          <SelectItem value="NEWS">News</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={params.status || "ALL"}
        onValueChange={(v) => updateFilter("status", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="TRASH">Trash</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={params.locale || "ALL"}
        onValueChange={(v) => updateFilter("locale", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Locale" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Locales</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="my">Myanmar</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={params.orderBy || "createdAt"}
        onValueChange={(v) => updateFilter("orderBy", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created</SelectItem>
          <SelectItem value="publishedAt">Published</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="modifiedAt">Modified</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={params.orderDir || "desc"}
        onValueChange={(v) => updateFilter("orderDir", v)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">DESC</SelectItem>
          <SelectItem value="asc">ASC</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
