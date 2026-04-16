import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";

const base =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const client = hc<AppType>(base);

export type ApiClient = typeof client;
