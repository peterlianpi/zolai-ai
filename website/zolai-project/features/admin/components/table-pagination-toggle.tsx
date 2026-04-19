"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTablePagination } from "@/features/settings/hooks/use-table-pagination";
import { useEffect, useState } from "react";
import { updateUserPreferences } from "@/action/profile";
import { toast } from "sonner";

export function TablePaginationToggle() {
  const { tablePagination, isLoading } = useTablePagination();
  const [isInfinite, setIsInfinite] = useState(tablePagination === "infinite");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsInfinite(tablePagination === "infinite");
  }, [tablePagination]);

  const handleToggle = async (checked: boolean) => {
    setIsInfinite(checked);
    setIsSaving(true);
    try {
      const result = await updateUserPreferences({
        tablePagination: checked ? "infinite" : "normal",
      });
      if (result.success) {
        toast.success(`Switched to ${checked ? "infinite scroll" : "normal pagination"}`);
      } else {
        toast.error("Failed to save preference");
      }
    } catch {
      toast.error("Failed to save preference");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isInfinite}
        onCheckedChange={handleToggle}
        disabled={isSaving || isLoading}
        id="table-pagination-toggle"
      />
      <Label htmlFor="table-pagination-toggle" className="text-sm cursor-pointer">
        {isInfinite ? "Infinite Scroll" : "Normal Pagination"}
      </Label>
    </div>
  );
}
