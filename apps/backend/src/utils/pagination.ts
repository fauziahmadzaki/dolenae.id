import { z } from "zod";
import type { ApiMeta } from "../types/api";

export const MAX_LIMIT = 100;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
  sort: z.string().trim().min(1).optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
  search: z.string().trim().min(1).optional(),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export interface Pagination extends PaginationQuery {
  offset: number;
}

export function toPagination(query: PaginationQuery): Pagination {
  return { ...query, offset: (query.page - 1) * query.limit };
}

export function buildMeta(total: number, page: number, limit: number): ApiMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
