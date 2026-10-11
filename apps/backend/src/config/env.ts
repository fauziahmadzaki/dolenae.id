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
  MAIL_FROM: z.string().default("Dolenae <no-reply@dolenae.id>"),
  // Google sign-in audience (OAuth client id). Empty = endpoint disabled.
  GOOGLE_CLIENT_ID: z.string().default(""),
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

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
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
