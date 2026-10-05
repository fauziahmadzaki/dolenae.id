/**
 * Tipe kontrak transport API (envelope response + pagination).
 * Ini bukan tipe domain — tipe domain tetap di `@dolenae/types`.
 */

export interface ApiMeta {
  requestId?: string;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Meta khusus hasil pagination. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Bentuk data untuk endpoint ber-pagination: { items, pagination }. */
export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}
