import { envSchema } from "../schemas/env.schema";
import type { Env } from "../types/env";

export class AppConfig {
  private static cached: AppConfig | null = null;

  private constructor(private readonly env: Env) {}

  static load(): AppConfig {
    if (AppConfig.cached) return AppConfig.cached;

    if (!process.env.GOOGLE_CLIENT_ID && process.env.AUTH_GOOGLE_ID) {
      process.env.GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID;
    }

    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      AppConfig.fail(
        "Invalid environment:",
        parsed.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        ),
      );
    }

    const env = parsed.data;
    if (env.NODE_ENV === "production") {
      const issues: string[] = [];
      if (
        env.JWT_SECRET.includes("dev-secret-change-me") ||
        env.JWT_SECRET.length < 32
      ) {
        issues.push(
          "JWT_SECRET harus diisi minimal 32 karakter dan bukan nilai default.",
        );
      }
      if (!env.CORS_ORIGIN.trim()) {
        issues.push("CORS_ORIGIN wajib diisi di production.");
      }
      if (
        env.STORAGE_DRIVER === "s3" &&
        env.S3_ACCESS_KEY_ID === "minioadmin" &&
        env.S3_SECRET_ACCESS_KEY === "minioadmin"
      ) {
        issues.push("Kredensial S3 default tidak boleh dipakai di production.");
      }
      if (issues.length > 0) AppConfig.fail("Invalid production environment:", issues);
    }

    if (
      env.NODE_ENV === "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)/.test(env.APP_WEB_URL)
    ) {
      console.warn(
        "[env] APP_WEB_URL points to localhost; email links will be unreachable outside this machine.",
      );
    }

    AppConfig.cached = new AppConfig(env);
    return AppConfig.cached;
  }

  private static fail(message: string, issues: string[]): never {
    console.error(message);
    for (const issue of issues) console.error(`  - ${issue}`);
    process.exit(1);
  }

  get nodeEnv(): Env["NODE_ENV"] {
    return this.env.NODE_ENV;
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === "production";
  }

  get port(): number {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get corsOrigins(): string[] {
    const raw = this.env.CORS_ORIGIN.trim();
    if (!raw) return [];
    return raw.split(",").map((value) => value.trim()).filter(Boolean);
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get jwtExpiresIn(): string {
    return this.env.JWT_EXPIRES_IN;
  }

  get appWebUrl(): string {
    return this.env.APP_WEB_URL;
  }

  get passwordResetTtlMinutes(): number {
    return this.env.PASSWORD_RESET_TTL_MINUTES;
  }

  get resendApiKey(): string {
    return this.env.RESEND_API_KEY;
  }

  get mailFrom(): string {
    return this.env.MAIL_FROM;
  }

  get mailReplyTo(): string {
    return this.env.MAIL_REPLY_TO;
  }

  get googleClientId(): string {
    return this.env.GOOGLE_CLIENT_ID;
  }

  get storageDriver(): Env["STORAGE_DRIVER"] {
    return this.env.STORAGE_DRIVER;
  }

  get uploadDir(): string {
    return this.env.UPLOAD_DIR;
  }

  get publicApiUrl(): string {
    return this.env.PUBLIC_API_URL;
  }

  get s3Endpoint(): string {
    return this.env.S3_ENDPOINT;
  }

  get s3Region(): string {
    return this.env.S3_REGION;
  }

  get s3Bucket(): string {
    return this.env.S3_BUCKET;
  }

  get s3AccessKeyId(): string {
    return this.env.S3_ACCESS_KEY_ID;
  }

  get s3SecretAccessKey(): string {
    return this.env.S3_SECRET_ACCESS_KEY;
  }

  get s3PublicUrl(): string {
    return this.env.S3_PUBLIC_URL;
  }

  get s3ForcePathStyle(): boolean {
    return this.env.S3_FORCE_PATH_STYLE;
  }

  get maxUploadMb(): number {
    return this.env.MAX_UPLOAD_MB;
  }

  get geminiApiKey(): string {
    return this.env.GEMINI_API_KEY;
  }

  get aiModel(): string {
    return this.env.AI_MODEL;
  }

  get aiTimeoutMs(): number {
    return this.env.AI_TIMEOUT_MS;
  }

  get aiDailyLimit(): number {
    return this.env.AI_DAILY_LIMIT;
  }

  get aiCacheTtlHours(): number {
    return this.env.AI_CACHE_TTL_HOURS;
  }

  get logLevel(): Env["LOG_LEVEL"] {
    return this.env.LOG_LEVEL;
  }

  get docsEnabled(): boolean {
    return this.env.DOCS_ENABLED;
  }

  get appEncryptionKey(): string {
    return this.env.APP_ENCRYPTION_KEY;
  }
}
