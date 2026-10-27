import { del, get, patch, post } from "~/lib/api/client";
import type { Category, Destination, DestinationDetail } from "~/types/domain";

export interface DestinationListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  difficulty?: string;
  status?: string;
  categoryId?: string;
}

function toQueryString(query: DestinationListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 8),
    sort: query.sort ?? "createdAt",
    order: query.order ?? "desc",
  });

  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.difficulty) params.set("difficulty", query.difficulty);
  if (query.status) params.set("status", query.status);
  if (query.categoryId) params.set("categoryId", query.categoryId);

  return params.toString();
}

/** Admin destination endpoints (`/api/destinations`). */
export const destinationsApi = {
  list: (
    query: DestinationListQuery,
    token?: string,
    signal?: AbortSignal,
  ) =>
    get<Destination[]>(`/destinations?${toQueryString(query)}`, {
      token,
      signal,
    }),

  get: (id: string, token?: string, signal?: AbortSignal) =>
    get<DestinationDetail>(`/destinations/${id}`, { token, signal }),

  create: (body: unknown, token?: string) =>
    post<DestinationDetail>("/destinations", body, { token }),

  update: (id: string, body: unknown, token?: string) =>
    patch<DestinationDetail>(`/destinations/${id}`, body, { token }),

  remove: (id: string, token?: string) =>
    del<void>(`/destinations/${id}`, { token }),
};

/** Admin category endpoints (`/api/categories`). */
export const categoriesApi = {
  list: (signal?: AbortSignal) =>
    get<Category[]>("/categories?limit=100&sort=name", { signal }),

  create: (body: unknown, token?: string) =>
    post<Category>("/categories", body, { token }),

  update: (id: string, body: unknown, token?: string) =>
    patch<Category>(`/categories/${id}`, body, { token }),

  remove: (id: string, token?: string) =>
    del<void>(`/categories/${id}`, { token }),
};
