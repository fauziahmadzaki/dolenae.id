import type { Response } from "express";
import type { ApiFailure, ApiMeta, ApiSuccess } from "../types/api";

/** Success envelope: { success: true, data, meta? }. */
export function ok<T>(
  res: Response,
  data: T,
  meta?: ApiMeta,
  status = 200,
): Response<ApiSuccess<T>> {
  const body: ApiSuccess<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return res.status(status).json(body);
}

/** Error envelope for handled cases; thrown errors go through the error handler. */
export function fail(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): Response<ApiFailure> {
  const body: ApiFailure = {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
  return res.status(status).json(body);
}
