import type { Category, CategoryType, Destination, TravelSupport } from "@dolenae/types";
import { apiFetch } from "~/lib/api";

/** Destinasi + kebutuhan pendukung (bentuk dari `GET /api/destinations/slug/:slug`). */
export type DestinationWithSupports = Destination & { supports: TravelSupport[] };

export interface DestinationListParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  status?: "draft" | "published";
  province?: string;
  categoryId?: string;
  terrain?: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// ---------- Public ----------

export async function listDestinations(
  params: DestinationListParams = {},
): Promise<Destination[]> {
  const { data } = await apiFetch<Destination[]>(`/destinations${toQuery(params)}`);
  return data;
}

export async function getDestinationBySlug(
  slug: string,
): Promise<DestinationWithSupports | null> {
  try {
    const { data } = await apiFetch<DestinationWithSupports>(
      `/destinations/slug/${encodeURIComponent(slug)}`,
    );
    return data;
  } catch (err) {
    if (
      err instanceof Error &&
      "status" in err &&
      (err as { status: number }).status === 404
    ) {
      return null;
    }
    throw err;
  }
}

// ---------- Admin ----------

export async function adminListDestinations(
  token: string,
  params: DestinationListParams = {},
): Promise<Page<Destination>> {
  const res = await apiFetch<Destination[]>(`/destinations${toQuery(params)}`, {
    token,
  });
  const p = (res.meta?.pagination ?? {}) as Record<string, number>;
  return {
    items: res.data,
    total: p.total ?? res.data.length,
    page: p.page ?? 1,
    limit: p.limit ?? res.data.length,
  };
}

export function createDestination(token: string, input: Record<string, unknown>) {
  return apiFetch<Destination>("/destinations", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  }).then((r) => r.data);
}

export function updateDestination(
  token: string,
  id: string,
  input: Record<string, unknown>,
) {
  return apiFetch<Destination>(`/destinations/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  }).then((r) => r.data);
}

export function deleteDestination(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/destinations/${id}`, {
    method: "DELETE",
    token,
  }).then((r) => r.data);
}

export function destinationStats(token: string) {
  return apiFetch<{ total: number; published: number; draft: number }>(
    "/destinations/stats",
    { token },
  ).then((r) => r.data);
}

// ---------- Kategori ----------

export async function listCategories(
  params: { type?: CategoryType; search?: string } = {},
  token?: string,
): Promise<Category[]> {
  const { data } = await apiFetch<Category[]>(
    `/categories${toQuery({ ...params, limit: 100 })}`,
    { token },
  );
  return data;
}

export function createCategory(token: string, input: Record<string, unknown>) {
  return apiFetch<Category>("/categories", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  }).then((r) => r.data);
}

export function updateCategory(
  token: string,
  id: string,
  input: Record<string, unknown>,
) {
  return apiFetch<Category>(`/categories/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  }).then((r) => r.data);
}

export function deleteCategory(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/categories/${id}`, {
    method: "DELETE",
    token,
  }).then((r) => r.data);
}

// ---------- Fasilitas ----------

export function listSupports(token: string, destinationId: string) {
  return apiFetch<TravelSupport[]>(
    `/supports${toQuery({ destinationId, limit: 100 })}`,
    { token },
  ).then((r) => r.data);
}

export function createSupport(token: string, input: Record<string, unknown>) {
  return apiFetch<TravelSupport>("/supports", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  }).then((r) => r.data);
}

export function updateSupport(
  token: string,
  id: string,
  input: Record<string, unknown>,
) {
  return apiFetch<TravelSupport>(`/supports/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  }).then((r) => r.data);
}

export function deleteSupport(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/supports/${id}`, {
    method: "DELETE",
    token,
  }).then((r) => r.data);
}
