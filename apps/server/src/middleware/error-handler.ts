import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { isProduction } from "../config/env";
import { AppError } from "../utils/errors";
import type { ApiFailure } from "../types/api";
import type { AppEnv } from "../types/auth";

function buildFailure(error: ApiFailure["error"]): ApiFailure {
  return { success: false, error };
}

/**
 * Global error handler. Memetakan semua error ke payload seragam:
 *   { success: false, error: { code, message, details? } }
 */
export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  const requestId = c.get("requestId");

  // 1) Error aplikasi (diharapkan)
  if (err instanceof AppError) {
    if (!err.expose || err.statusCode >= 500) {
      console.error(`[${requestId}] ${err.name}:`, err.message, err.cause ?? "");
    }
    return c.json(
      buildFailure({
        code: err.code,
        message: err.expose ? err.message : "Terjadi kesalahan pada server",
        ...(err.expose && err.details !== undefined
          ? { details: err.details }
          : {}),
      }),
      err.statusCode as 400,
    );
  }

  // 2) Error validasi Zod (dari middleware validate)
  if (err instanceof ZodError) {
    return c.json(
      buildFailure({
        code: "VALIDATION_ERROR",
        message: "Data permintaan tidak valid",
        details: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      }),
      422,
    );
  }

  // 3) HTTPException dari Hono
  if (err instanceof HTTPException) {
    return c.json(
      buildFailure({ code: `HTTP_${err.status}`, message: err.message }),
      err.status,
    );
  }

  // 4) Fallback — jangan bocorkan detail internal saat production
  console.error(`[${requestId}] Unhandled error:`, err);
  return c.json(
    buildFailure({
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan pada server",
      ...(isProduction()
        ? {}
        : { details: err instanceof Error ? err.message : String(err) }),
    }),
    500,
  );
};

/** Handler 404 untuk route yang tidak cocok. */
export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  c.json(
    buildFailure({
      code: "NOT_FOUND",
      message: `Route tidak ditemukan: ${c.req.method} ${c.req.path}`,
    }),
    404,
  );
