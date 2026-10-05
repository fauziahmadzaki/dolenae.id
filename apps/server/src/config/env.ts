import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

/**
 * Muat file `.env` (tanpa dependency tambahan). Variabel yang sudah ada di
 * process.env tidak ditimpa, sehingga env eksternal tetap menang.
 */
function loadDotEnv(): void {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/**
 * Skema env server. Gagal cepat (fail-fast) saat startup bila ada yang salah,
 * supaya tidak ada error misterius di tengah runtime.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL wajib diisi (lihat apps/server/.env.example)"),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET minimal 16 karakter")
    .default("dev-secret-change-me-please"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  /** Daftar origin dipisah koma; kosong = izinkan semua (cocok untuk dev). */
  CORS_ORIGIN: z.string().optional().default(""),
  /** Object storage S3-compatible (MinIO self-host / R2 / S3). */
  S3_ENDPOINT: z.string().url("S3_ENDPOINT harus URL"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  /** Base URL publik untuk membentuk `url` file. Default: `${S3_ENDPOINT}/${S3_BUCKET}`. */
  S3_PUBLIC_URL: z.string().url().optional(),
  S3_FORCE_PATH_STYLE: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  /** Batas ukuran upload (MB). */
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(5),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Baca + validasi env sekali, lalu cache. */
export function loadEnv(): Env {
  if (cached) return cached;

  loadDotEnv();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Konfigurasi env tidak valid:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

/** Helper: apakah sedang di production. */
export function isProduction(): boolean {
  return loadEnv().NODE_ENV === "production";
}

/** Helper: daftar origin CORS (array kosong = izinkan semua). */
export function corsOrigins(): string[] {
  return loadEnv()
    .CORS_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

/** Helper: konfigurasi object storage. */
export function storageConfig() {
  const env = loadEnv();
  return {
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    bucket: env.S3_BUCKET,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    publicUrl: (env.S3_PUBLIC_URL ?? `${env.S3_ENDPOINT}/${env.S3_BUCKET}`).replace(/\/$/, ""),
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    maxUploadBytes: env.MAX_UPLOAD_MB * 1024 * 1024,
  };
}
