"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCreateMenuItem, useDeleteMenuItem, useMenus, useUpdateMenuItem } from "@/features/menus/hooks";
import type { Menu, MenuItem } from "@/features/menus/types";

function flattenItems(items: MenuItem[], depth = 0): Array<MenuItem & { depth: number }> {
  const result: Array<MenuItem & { depth: number }> = [];
  for (const item of items) {
    result.push({ ...item, depth });
    if (item.children?.length) {
      result.push(...flattenItems(item.children, depth + 1));
    }
  }
  return result;
}

export function AdminMenuManager() {
  const { data: menus = [], isLoading } = useMenus();
  const [menuId, setMenuId] = useState<string | undefined>(undefined);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState<"_self" | "_blank">("_self");
  const [order, setOrder] = useState("0");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const selectedMenu: Menu | undefined = useMemo(() => {
    const fallback = menus.find((m) => m.location === "header") ?? menus[0];
    return menus.find((m) => m.id === menuId) ?? fallback;
  }, [menus, menuId]);

  const items = useMemo(() => {
    if (!selectedMenu) return [];
    return flattenItems(selectedMenu.items ?? []);
  }, [selectedMenu]);

  const topLevelItems = useMemo(() => {
    return selectedMenu?.items ?? [];
  }, [selectedMenu]);

  const resetForm = () => {
    setLabel("");
    setUrl("");
    setTarget("_self");
    setOrder("0");
    setParentId(undefined);
  };

  const handleCreate = async () => {
    if (!selectedMenu) return;
    await createItem.mutateAsync({
      menuId: selectedMenu.id,
      label: label.trim(),
      url: url.trim(),
      target,
      order: Number(order) || 0,
      parentId,
    });
    resetForm();
  };

  const startEdit = (item: MenuItem) => {
    setEditing(item);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await updateItem.mutateAsync({
      id: editing.id,
      data: {
        label: editing.label,
        url: editing.url ?? "",
        target: editing.target ?? "_self",
        order: editing.order,
        parentId: editing.parentId ?? undefined,
      },
    });
    setEditing(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-0">
      <Card>
        <CardHeader>
          <CardTitle>Menus</CardTitle>
          <CardDescription>Manage header and footer navigation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Menu</Label>
            <Select
              value={selectedMenu?.id}
              onValueChange={(value) => setMenuId(value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select menu" />
              </SelectTrigger>
              <SelectContent>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name} {menu.location ? `(${menu.location})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label>New Menu Item</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                placeholder="Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Input
                placeholder="URL (https://... or /path)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <Select value={target} onValueChange={(value) => setTarget(value as "_self" | "_blank")}>
                <SelectTrigger>
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same tab</SelectItem>
                  <SelectItem value="_blank">New tab</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Order"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
              <Select value={parentId ?? "null"} onValueChange={(value) => setParentId(value === "null" ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Parent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">No parent</SelectItem>
                  {topLevelItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleCreate}
                disabled={!selectedMenu || !label.trim() || createItem.isPending}
              >
                Add item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>Reorder using the Order field.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div className="min-w-0" style={{ marginLeft: item.depth * 12 }}>
                  <p className="font-medium truncate">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.url || "(no url)"} · Order {item.order}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(item)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit menu item</DialogTitle>
            <DialogDescription>Update label, URL, order, or parent.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-2">
              <Input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder="Label"
              />
              <Input
                value={editing.url ?? ""}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                placeholder="URL"
              />
              <Select
                value={editing.target ?? "_self"}
                onValueChange={(value) =>
                  setEditing({ ...editing, target: value as "_self" | "_blank" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same tab</SelectItem>
                  <SelectItem value="_blank">New tab</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={String(editing.order ?? 0)}
                onChange={(e) =>
                  setEditing({ ...editing, order: Number(e.target.value) || 0 })
                }
                placeholder="Order"
              />
               <Select
                 value={editing.parentId ?? "null"}
                 onValueChange={(value) =>
                   setEditing({
                     ...editing,
                     parentId: value === "null" ? null : value,
                   })
                 }
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Parent (optional)" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="null">No parent</SelectItem>
                   {topLevelItems
                     .filter((item) => item.id !== editing.id)
                     .map((item) => (
                       <SelectItem key={item.id} value={item.id}>
                         {item.label}
                       </SelectItem>
                     ))}
                 </SelectContent>
               </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateItem.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete menu item"
        description="Are you sure you want to delete this menu item?"
        confirmLabel="Delete"
        destructive
        isLoading={deleteItem.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteItem.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
      />
    </div>
  );
}
