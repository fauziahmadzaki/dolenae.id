import { apiFetch, type ApiUser, type AuthResult, type PaginationMeta } from "~/lib/api";

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMe(token: string) {
  return apiFetch<ApiUser>("/users/me", { token });
}

export function listUsers(
  token: string,
  params: { page?: number; limit?: number; search?: string } = {},
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch<ApiUser[]>(`/users${suffix}`, { token }).then((r) => ({
    items: r.data,
    pagination: (r.meta?.pagination ?? {
      page: 1,
      limit: 10,
      total: r.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }) as PaginationMeta,
  }));
}
