import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiMeta } from "../types/api";

/**
 * Helper response sukses:
 *   { success: true, data, meta? }
 */
export function ok<T>(
  c: Context,
  data: T,
  meta?: ApiMeta,
  status: ContentfulStatusCode = 200,
) {
  return c.json(
    { success: true as const, data, ...(meta ? { meta } : {}) },
    status,
  );
}

/**
 * Helper response gagal:
 *   { success: false, error: { code, message, details? } }
 *
 * Catatan: untuk alur error yang dilempar (throw), biarkan global error handler
 * yang memakai `fail`. Helper ini untuk error yang ditangani di tempat.
 */
export function fail(
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode = 400,
  details?: unknown,
) {
  return c.json(
    {
      success: false as const,
      error: { code, message, ...(details !== undefined ? { details } : {}) },
    },
    status,
  );
}
