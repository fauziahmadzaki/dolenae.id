import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../types/auth";

/**
 * Beri setiap request sebuah request id (untuk korelasi log & response).
 * Pakai header masuk `X-Request-Id` bila ada, kalau tidak generate.
 */
export const requestId = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const incoming = c.req.header("x-request-id");
  const id = incoming && incoming.trim() ? incoming.trim() : crypto.randomUUID();
  c.set("requestId", id);
  c.header("X-Request-Id", id);
  await next();
};
