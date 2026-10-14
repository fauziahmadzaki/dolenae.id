import { apiReference } from "@scalar/express-api-reference";
import cors from "cors";
import express from "express";
import helmet from "helmet";
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
  const helmetMiddleware = helmet();
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
      origin: origins.length > 0 ? origins : true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id"],
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

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
