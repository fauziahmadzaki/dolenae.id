import type { UserRole } from "@dolenae/types";

/** Bentuk response server (envelope). */
interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** User seperti yang dikembalikan API (tanpa password). */
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: ApiUser;
}

/** Error API yang membawa kode + detail dari server. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

/** Request ke API dengan envelope + error handling seragam. */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!res.ok || !body || body.success === false) {
    const error = body && body.success === false ? body.error : undefined;
    throw new ApiError(
      res.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? `Permintaan gagal (${res.status})`,
      error?.details,
    );
  }

  return { data: body.data, meta: body.meta };
}
