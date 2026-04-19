import { client } from "@/lib/api/client";
import type { Menu } from "../types";

export async function getPublicMenus(): Promise<Menu[]> {
  const response = await client.api.menus.public.$get();
  if (!response.ok) {
    throw new Error("Failed to fetch menus");
  }
  const json = (await response.json()) as { success?: boolean; data?: Menu[] };
  if (!json.success || !json.data) return [];
  return json.data;
}
