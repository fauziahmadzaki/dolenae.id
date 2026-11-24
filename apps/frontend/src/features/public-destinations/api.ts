import { get } from "~/lib/api/client";
import type { Destination, Difficulty } from "~/types/domain";

export interface PublicDestinationQuery {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: Difficulty | "";
  sort?: "createdAt" | "name" | "updatedAt" | "elevationMeters";
  order?: "asc" | "desc";
}

/** Bangun query string katalog publik (selalu `status=published`). */
export function toPublicQueryString(query: PublicDestinationQuery): string {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 12),
    sort: query.sort ?? "createdAt",
    order: query.order ?? "desc",
    status: "published",
  });

  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.difficulty) params.set("difficulty", query.difficulty);

  return params.toString();
}

/** Endpoint katalog publik yang dipanggil dari client. */
export const publicDestinationsApi = {
  list: (query: PublicDestinationQuery, signal?: AbortSignal) =>
    get<Destination[]>(`/destinations?${toPublicQueryString(query)}`, {
      signal,
    }),
};
