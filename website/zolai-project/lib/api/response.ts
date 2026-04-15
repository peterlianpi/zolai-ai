import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Standard API success response helper
 */
export const ok = <T>(c: Context, data: T) => {
  return c.json({ success: true, data }, 200);
};

/**
 * Standard API created response helper
 */
export const created = <T>(c: Context, data: T) => {
  return c.json({ success: true, data }, 201);
};

/**
 * Standard API error response helper
 */
export const error = (
  c: Context,
  message: string,
  code?: string,
  status: ContentfulStatusCode = 400
) => {
  return c.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    status
  );
};

/**
 * Standard paginated list response helper
 */
export const list = <T, M extends {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>(
  c: Context,
  data: T[],
  meta: M
) => {
  const normalizedMeta = {
    ...meta,
    page: Math.max(1, meta.page),
    limit: Math.max(1, meta.limit),
    totalPages: Math.max(1, meta.totalPages),
  };

  return c.json(
    {
      success: true,
      data,
      meta: normalizedMeta,
    },
    200
  );
};

/**
 * Not Found error helper
 */
export const notFound = (c: Context, message = "Resource not found") => {
  return error(c, message, "NOT_FOUND", 404);
};

/**
 * Unauthorized error helper
 */
export const unauthorized = (c: Context, message = "Unauthorized access") => {
  return error(c, message, "UNAUTHORIZED", 401);
};

/**
 * Bad Request error helper
 */
export const badRequest = (c: Context, message = "Bad request") => {
  return error(c, message, "BAD_REQUEST", 400);
};

/**
 * Forbidden error helper
 */
export const forbidden = (c: Context, message = "Permission denied") => {
  return error(c, message, "FORBIDDEN", 403);
};

/**
 * Conflict error helper
 */
export const conflict = (c: Context, message = "Already exists") => {
  return error(c, message, "CONFLICT", 409);
};

/**
 * Internal Server Error helper
 */
export const internalError = (c: Context, message = "Internal server error") => {
  return error(c, message, "INTERNAL_SERVER_ERROR", 500);
};
