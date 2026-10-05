/**
 * Hirarki error aplikasi. Semua error yang "diharapkan" memakai `AppError`
 * agar global error handler dapat memetakan ke HTTP status + kode yang stabil.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  /** true = aman ditampilkan ke klien (bukan bug internal). */
  readonly expose: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    options: { details?: unknown; expose?: boolean; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
    this.expose = options.expose ?? statusCode < 500;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Permintaan tidak valid", details?: unknown) {
    super(400, "BAD_REQUEST", message, { details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Kamu perlu masuk terlebih dahulu") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Kamu tidak punya akses ke resource ini") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource tidak ditemukan") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource sudah ada", details?: unknown) {
    super(409, "CONFLICT", message, { details });
  }
}

export class ValidationError extends AppError {
  constructor(message = "Data tidak valid", details?: unknown) {
    super(422, "VALIDATION_ERROR", message, { details });
  }
}

/** Bungkus error tak terduga yang tidak ingin kita bocorkan ke klien. */
export class InternalError extends AppError {
  constructor(message = "Terjadi kesalahan pada server", cause?: unknown) {
    super(500, "INTERNAL_ERROR", message, { expose: false, cause });
  }
}
