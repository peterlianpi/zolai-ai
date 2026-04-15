import { client } from "@/lib/api/client";
import type { RedirectListResponse } from "../types";

export async function getRedirects(params: {
  enabled?: boolean;
  page?: number;
  limit?: number;
}): Promise<RedirectListResponse> {
  const query: Record<string, string> = {};
  if (params.enabled !== undefined) query.enabled = params.enabled.toString();
  if (params.page) query.page = params.page.toString();
  if (params.limit) query.limit = params.limit.toString();

  const response = await client.api.redirects.$get({ query });

  if (!response.ok) {
    throw new Error("Failed to fetch redirects");
  }

  const json = (await response.json()) as unknown as RedirectListResponse;
  return json;
}

interface DeleteRedirectResponse {
  success?: boolean;
  error?: {
    message?: string;
  };
}

export async function deleteRedirect(id: string): Promise<DeleteRedirectResponse> {
  const response = await client.api.redirects[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    const json = (await response.json()) as DeleteRedirectResponse;
    throw new Error(json.error?.message || "Failed to delete redirect");
  }

  return (await response.json()) as DeleteRedirectResponse;
}
