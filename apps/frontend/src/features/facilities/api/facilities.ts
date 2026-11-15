import { del, get, patch, post } from "~/lib/api/client";
import type {
  Facility,
  FacilityDetail,
  FacilityProduct,
  FacilityStatus,
  MerchantProduct,
} from "../types";

export interface FacilityListQuery {
  page?: number;
  limit?: number;
  status?: FacilityStatus;
  category?: string;
  type?: string;
}

function toQueryString(query: FacilityListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 100),
    order: "asc",
  });
  if (query.status) params.set("status", query.status);
  if (query.category) params.set("category", query.category);
  if (query.type?.trim()) params.set("type", query.type.trim());
  return params.toString();
}

export interface MerchantProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  facilityId?: string;
}

function toProductQueryString(query: MerchantProductListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
    order: "asc",
  });
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.facilityId) params.set("facilityId", query.facilityId);
  return params.toString();
}

export const facilitiesApi = {
  listMine: (query: FacilityListQuery, token?: string, signal?: AbortSignal) =>
    get<Facility[]>(`/facilities/mine?${toQueryString(query)}`, {
      token,
      signal,
    }),

  get: (id: string, token?: string, signal?: AbortSignal) =>
    get<FacilityDetail>(`/facilities/${id}`, { token, signal }),

  listMineProducts: (
    query: MerchantProductListQuery,
    token?: string,
    signal?: AbortSignal,
  ) =>
    get<MerchantProduct[]>(`/products/mine?${toProductQueryString(query)}`, {
      token,
      signal,
    }),

  create: (body: unknown, token?: string) =>
    post<Facility>("/facilities", body, { token }),

  update: (id: string, body: unknown, token?: string) =>
    patch<Facility>(`/facilities/${id}`, body, { token }),

  remove: (id: string, token?: string) =>
    del<void>(`/facilities/${id}`, { token }),

  addProduct: (facilityId: string, body: unknown, token?: string) =>
    post<FacilityProduct>(`/facilities/${facilityId}/products`, body, {
      token,
    }),

  updateProduct: (
    facilityId: string,
    productId: string,
    body: unknown,
    token?: string,
  ) =>
    patch<FacilityProduct>(
      `/facilities/${facilityId}/products/${productId}`,
      body,
      { token },
    ),

  removeProduct: (facilityId: string, productId: string, token?: string) =>
    del<void>(`/facilities/${facilityId}/products/${productId}`, { token }),
};
