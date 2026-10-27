import { apiReference } from "@scalar/express-api-reference";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { resolve } from "node:path";
import pinoHttp from "pino-http";
import { corsOrigins, loadEnv } from "./config/env";
import { requestId } from "./middleware/request-id";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { openApiDocument } from "./openapi/document";
import { apiRouter } from "./routes";
import { ok } from "./utils/response";

/** Build the Express app: global middleware → `/api` router → 404 + error handler. */
export function createApp() {
  const env = loadEnv();
  const app = express();

  app.disable("x-powered-by");
  app.use(requestId());
  app.use(
    pinoHttp({
      level: env.LOG_LEVEL,
      genReqId: (req) => (req as { requestId?: string }).requestId ?? "-",
    }),
  );
  const helmetMiddleware = helmet({
    // Uploaded images are embedded by the web app on another origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
  app.use((req, res, next) => {
    // Scalar docs load a CDN script + inline module; CSP would block them.
    if (req.path.startsWith("/api/docs")) {
      res.setHeader("Cache-Control", "no-store");
      return next();
    }
    helmetMiddleware(req, res, next);
  });

  const origins = corsOrigins();
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origins.length === 0 || origins.includes(origin)) {
          return callback(null, true);
        }
        if (env.NODE_ENV !== "production") {
          const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
          if (isLocalhost) return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id"],
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Local storage driver: serve uploaded images from the API origin.
  if (env.STORAGE_DRIVER === "local") {
    app.use(
      "/uploads",
      express.static(resolve(env.UPLOAD_DIR), {
        maxAge: "1y",
        immutable: true,
      }),
    );
  }

  if (env.DOCS_ENABLED) {
    app.get("/api/openapi.json", (_req, res) => res.json(openApiDocument));
    app.use(
      "/api/docs",
      apiReference({ spec: { url: "/api/openapi.json" } }),
    );
  }

  app.get("/", (_req, res) =>
    ok(res, { service: "Dolenae API", version: "0.1.0", docs: "/api/docs" }),
  );

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
