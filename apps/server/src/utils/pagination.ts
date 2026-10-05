import type { Context } from "hono";
import type { Paginated, PaginationMeta } from "../types/api";
import { BadRequestError } from "./errors";

export interface PaginationParams {
  page: number;
  limit: number;
  /** Kolom untuk pengurutan (validasi di layer repository). */
  sort?: string;
  /** Urutan pengurutan. */
  order: "asc" | "desc";
  /** Kata kunci pencarian opsional. */
  search?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Ambil parameter pagination dari query string dengan default & batas aman.
 *   ?page=1&limit=20&sort=createdAt&order=desc&search=bromo
 */
export function parsePagination(c: Context): PaginationParams {
  const rawPage = c.req.query("page");
  const rawLimit = c.req.query("limit");

  const page = rawPage ? Number(rawPage) : DEFAULT_PAGE;
  const limit = rawLimit ? Number(rawLimit) : DEFAULT_LIMIT;

  if (!Number.isInteger(page) || page < 1) {
    throw new BadRequestError("Parameter 'page' harus bilangan bulat >= 1");
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new BadRequestError("Parameter 'limit' harus bilangan bulat >= 1");
  }
  if (limit > MAX_LIMIT) {
    throw new BadRequestError(`Parameter 'limit' maksimal ${MAX_LIMIT}`);
  }

  const order = c.req.query("order") === "asc" ? "asc" : "desc";
  const sort = c.req.query("sort") || undefined;
  const search = c.req.query("search")?.trim() || undefined;

  return { page, limit, sort, order, search };
}

/** Hitung offset dari page & limit (untuk SQL OFFSET). */
export function toOffset({ page, limit }: Pick<PaginationParams, "page" | "limit">): number {
  return (page - 1) * limit;
}

/** Bentuk meta pagination dari total baris. */
export function buildPaginationMeta(
  total: number,
  { page, limit }: Pick<PaginationParams, "page" | "limit">,
): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/** Bungkus items + total menjadi payload data ber-pagination. */
export function paginate<T>(
  items: T[],
  total: number,
  params: Pick<PaginationParams, "page" | "limit">,
): Paginated<T> {
  return { items, pagination: buildPaginationMeta(total, params) };
}
