import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { corsOrigins } from "./config/env";
import { requestId } from "./middleware/request-id";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { apiRouter } from "./routes";
import { ok } from "./utils/response";
import type { AppEnv } from "./types/auth";

/**
 * Bangun instance Hono lengkap: middleware global + router `/api` +
 * global error handler & not-found handler.
 */
export function createApp() {
  const app = new Hono<AppEnv>();

  app.use("*", requestId());
  app.use("*", logger());
  app.use("*", secureHeaders());

  const origins = corsOrigins();
  app.use(
    "*",
    cors({
      origin: origins.length > 0 ? origins : "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposeHeaders: ["X-Request-Id"],
    }),
  );

  app.use("*", bodyLimit({ maxSize: 1 * 1024 * 1024 })); // 1 MB

  // Root: info API
  app.get("/", (c) =>
    ok(c, {
      service: "Dolenae API",
      version: "0.1.0",
      endpoints: [
        "GET /api/health",
        "POST /api/auth/register",
        "POST /api/auth/login",
        "GET /api/users/me",
        "GET /api/users (admin)",
        "GET /api/categories",
        "POST /api/categories (admin)",
        "GET /api/destinations",
        "GET /api/destinations/slug/:slug",
        "POST /api/destinations (admin)",
        "GET /api/supports",
        "GET /api/regions/provinces",
        "GET /api/regions/reverse?lat=&lng=",
        "POST /api/uploads (admin, multipart 'file')",
      ],
    }),
  );

  app.route("/api", apiRouter);

  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}

export const app = createApp();
