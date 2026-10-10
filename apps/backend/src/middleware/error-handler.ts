import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env";
import { AppError } from "../utils/errors";
import type { ApiFailure } from "../types/api";

export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiFailure = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route tidak ditemukan: ${req.method} ${req.path}`,
    },
  };
  res.status(404).json(body);
};

/** Maps errors to the uniform error envelope. Register last. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (res.headersSent) return;

  const requestId = req.requestId ?? "-";

  if (err instanceof AppError) {
    if (!err.expose || err.statusCode >= 500) {
      console.error(`[${requestId}] ${err.name}:`, err.message, err.cause ?? "");
    }
    const body: ApiFailure = {
      success: false,
      error: {
        code: err.code,
        message: err.expose ? err.message : "Terjadi kesalahan pada server",
        ...(err.expose && err.details !== undefined
          ? { details: err.details }
          : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiFailure = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data permintaan tidak valid",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
    res.status(422).json(body);
    return;
  }

  console.error(`[${requestId}] Unhandled error:`, err);
  const body: ApiFailure = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan pada server",
      ...(isProduction()
        ? {}
        : { details: err instanceof Error ? err.message : String(err) }),
    },
  };
  res.status(500).json(body);
};
