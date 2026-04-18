import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";

const base =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Use window.fetch so the CSRF interceptor (which patches window.fetch) applies to all RPC calls
export const client = hc<AppType>(base, {
  fetch: (...args) =>
    typeof window !== "undefined" ? window.fetch(...args) : fetch(...args),
});

export type ApiClient = typeof client;
