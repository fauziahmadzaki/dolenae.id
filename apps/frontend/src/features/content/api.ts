import { del, get, patch, post } from "~/lib/api/client";

export type ContentKind = "artikel" | "panduan" | "tips";
export type ContentStatus = "draft" | "pending" | "published";

export interface ContentAuthor {
  id: string;
  name: string;
}

/** Article row as returned by `GET /api/admin/contents`. */
export interface AdminContent {
  id: string;
  title: string;
  slug: string;
  kind: ContentKind;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  status: ContentStatus;
  author: ContentAuthor | null;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Photo row as returned by `GET /api/admin/gallery`. */
export interface GalleryPhoto {
  id: string;
  fileName: string;
  url: string;
  mime: string;
  size: number;
  region: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  kind?: ContentKind;
  status?: ContentStatus;
}

export interface GalleryListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  region?: string;
}

export interface ContentPayload {
  title: string;
  kind: ContentKind;
  excerpt?: string | null;
  body: string;
  coverUrl?: string | null;
  status: ContentStatus;
}

function toQueryString(query: ContentListQuery | GalleryListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
    order: query.order ?? "desc",
  });
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.sort) params.set("sort", query.sort);
  if ("kind" in query && query.kind) params.set("kind", query.kind);
  if ("status" in query && query.status) params.set("status", query.status);
  if ("region" in query && query.region?.trim()) {
    params.set("region", query.region.trim());
  }
  return params.toString();
}

/** Admin content + gallery endpoints. */
export const contentsApi = {
  list: (query: ContentListQuery, token?: string, signal?: AbortSignal) =>
    get<AdminContent[]>(`/admin/contents?${toQueryString(query)}`, {
      token,
      signal,
    }),

  get: (id: string, token?: string) => get<AdminContent>(`/admin/contents/${id}`, { token }),

  create: (payload: ContentPayload, token?: string) =>
    post<AdminContent>("/admin/contents", payload, { token }),

  update: (id: string, payload: Partial<ContentPayload>, token?: string) =>
    patch<AdminContent>(`/admin/contents/${id}`, payload, { token }),

  remove: (id: string, token?: string) =>
    del<{ id: string; deleted: true }>(`/admin/contents/${id}`, { token }),
};

export const galleryApi = {
  list: (query: GalleryListQuery, token?: string, signal?: AbortSignal) =>
    get<GalleryPhoto[]>(`/admin/gallery?${toQueryString(query)}`, {
      token,
      signal,
    }),

  create: (
    payload: {
      url: string;
      key: string;
      name: string;
      mime: string;
      size: number;
      region?: string | null;
    },
    token?: string,
  ) => post<GalleryPhoto>("/admin/gallery", payload, { token }),

  update: (
    id: string,
    payload: { name?: string; region?: string | null },
    token?: string,
  ) => patch<GalleryPhoto>(`/admin/gallery/${id}`, payload, { token }),

  remove: (id: string, token?: string) =>
    del<{ id: string; deleted: true }>(`/admin/gallery/${id}`, { token }),
};
