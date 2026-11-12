import { del, get, patch, post } from "~/lib/api/client";
import type { ManagedUser } from "../schema";

export interface UserListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  role?: string;
  status?: string;
}

function toQueryString(query: UserListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 6),
    sort: query.sort ?? "createdAt",
    order: query.order ?? "desc",
  });

  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);

  return params.toString();
}

/** Admin user endpoints (`/api/users`). */
export const usersApi = {
  list: (
    query: UserListQuery,
    token?: string,
    signal?: AbortSignal,
  ) => get<ManagedUser[]>(`/users?${toQueryString(query)}`, { token, signal }),

  get: (id: string, token?: string, signal?: AbortSignal) =>
    get<ManagedUser>(`/users/${id}`, { token, signal }),

  create: (body: unknown, token?: string) =>
    post<ManagedUser>("/users", body, { token }),

  update: (id: string, body: unknown, token?: string) =>
    patch<ManagedUser>(`/users/${id}`, body, { token }),

  remove: (id: string, token?: string) => del<void>(`/users/${id}`, { token }),
};
