import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (see .env.example)"),
  CORS_ORIGIN: z.string().default(""),
  JWT_SECRET: z.string().min(1).default("dev-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  APP_WEB_URL: z.string().url().default("http://localhost:3000"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  RESEND_API_KEY: z.string().default(""),
  MAIL_FROM: z.string().default("Dolenae <no-reply@dolenae.web.id>"),
  MAIL_REPLY_TO: z.string().default(""),
  GOOGLE_CLIENT_ID: z.string().default(""),
  STORAGE_DRIVER: z.enum(["s3", "local"]).default("s3"),
  UPLOAD_DIR: z.string().default("uploads"),
  PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
  S3_ENDPOINT: z.string().url().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("dolenae"),
  S3_ACCESS_KEY_ID: z.string().default("minioadmin"),
  S3_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
  S3_PUBLIC_URL: z.string().url().default("http://localhost:9000/dolenae"),
  S3_FORCE_PATH_STYLE: z
    .string()
    .default("true")
    .transform((value) => value.toLowerCase() !== "false"),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(5),
  GEMINI_API_KEY: z.string().default(""),
  AI_MODEL: z.string().default("gemini-3.5-flash"),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_DAILY_LIMIT: z.coerce.number().int().positive().default(10),
  AI_CACHE_TTL_HOURS: z.coerce.number().int().positive().default(24),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  DOCS_ENABLED: z
    .string()
    .default("true")
    .transform((value) => value.toLowerCase() !== "false"),
  APP_ENCRYPTION_KEY: z
    .string()
    .refine((value) => {
      try {
        return Buffer.from(value, "base64").length === 32;
      } catch {
        return false;
      }
    }, "APP_ENCRYPTION_KEY harus 32 byte dalam base64"),
});
