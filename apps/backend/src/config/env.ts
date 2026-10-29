import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (see .env.example)"),
  CORS_ORIGIN: z.string().default(""),
  JWT_SECRET: z.string().min(1).default("dev-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // Public URL of the web app, used to build links (e.g. password reset).
  APP_WEB_URL: z.string().url().default("http://localhost:3000"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  // Email (Resend). Empty key = dev mode, emails are logged instead of sent.
  RESEND_API_KEY: z.string().default(""),
  MAIL_FROM: z.string().default("Dolenae <no-reply@dolenae.web.id>"),
  // Optional Reply-To for transactional mail (no-reply addresses bounce).
  MAIL_REPLY_TO: z.string().default(""),
  // Google sign-in audience (OAuth client id). Empty = endpoint disabled.
  GOOGLE_CLIENT_ID: z.string().default(""),
  // Image storage (S3-compatible; MinIO in development).
  STORAGE_DRIVER: z.enum(["s3", "local"]).default("s3"),
  /** Local driver only: folder + public base of the API serving /uploads. */
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
  // AI itinerary (Gemini). Empty key = deterministic fallback only.
  GEMINI_API_KEY: z.string().default(""),
  AI_MODEL: z.string().default("gemini-2.5-flash"),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_DAILY_LIMIT: z.coerce.number().int().positive().default(10),
  AI_CACHE_TTL_HOURS: z.coerce.number().int().positive().default(24),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  DOCS_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v.toLowerCase() !== "false"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Validate and cache the environment; exit on failure. */
export function loadEnv(): Env {
  if (cached) return cached;

  // NextAuth-style alias: either name works for the Google OAuth client id.
  if (!process.env.GOOGLE_CLIENT_ID && process.env.AUTH_GOOGLE_ID) {
    process.env.GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  // Links inside transactional emails are built from APP_WEB_URL, so a
  // localhost value in production silently ships broken links.
  if (
    parsed.data.NODE_ENV === "production" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)/.test(parsed.data.APP_WEB_URL)
  ) {
    console.warn(
      "[env] APP_WEB_URL points to localhost; email links will be unreachable outside this machine.",
    );
  }

  cached = parsed.data;
  return cached;
}

export function isProduction(): boolean {
  return loadEnv().NODE_ENV === "production";
}

/** Comma-separated CORS origins. Empty = allow all. */
export function corsOrigins(): string[] {
  const raw = loadEnv().CORS_ORIGIN.trim();
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
