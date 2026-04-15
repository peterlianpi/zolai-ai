import { client } from "@/lib/api/client";
import type { Menu, MenuItem } from "../types";

export async function listMenus(params?: { location?: string }): Promise<Menu[]> {
  const query: Record<string, string> = {};
  if (params?.location) query.location = params.location;

  const response = await client.api.menus.$get({ query });
  if (!response.ok) {
    throw new Error("Failed to fetch menus");
  }
  const json = (await response.json()) as { success?: boolean; data?: Menu[] };
  if (!json.success || !json.data) return [];
  return json.data;
}

export async function createMenuItem(input: {
  menuId: string;
  label: string;
  url?: string;
  target?: "_blank" | "_self";
  order?: number;
  parentId?: string;
}) {
  const response = await client.api.menus.items.$post({
    json: {
      ...input,
      parentId: input.parentId || undefined,
    },
  });
  if (!response.ok) {
    const json = (await response.json()) as { error?: { message?: string } };
    throw new Error(json.error?.message || "Failed to create menu item");
  }
  const json = (await response.json()) as { success?: boolean; data?: MenuItem };
  if (!json.success || !json.data) {
    throw new Error("Failed to create menu item");
  }
  return json.data;
}

export async function updateMenuItem(
  id: string,
  input: {
    label?: string;
    url?: string;
    target?: "_blank" | "_self";
    order?: number;
    parentId?: string;
  },
) {
  const response = await client.api.menus.items[":id"].$patch({
    param: { id },
    json: {
      ...input,
      parentId: input.parentId || undefined,
    },
  });
  if (!response.ok) {
    const json = (await response.json()) as { error?: { message?: string } };
    throw new Error(json.error?.message || "Failed to update menu item");
  }
  const json = (await response.json()) as { success?: boolean; data?: MenuItem };
  if (!json.success || !json.data) {
    throw new Error("Failed to update menu item");
  }
  return json.data;
}

export async function deleteMenuItem(id: string) {
  const response = await client.api.menus.items[":id"].$delete({
    param: { id },
  });
  if (!response.ok) {
    const json = (await response.json()) as { error?: { message?: string } };
    throw new Error(json.error?.message || "Failed to delete menu item");
  }
  const json = (await response.json()) as { success?: boolean };
  if (!json.success) {
    throw new Error("Failed to delete menu item");
  }
}
