"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "~/lib/api/types";
import {
  facilitiesApi,
  type FacilityListQuery,
  type MerchantProductListQuery,
} from "../api/facilities";

export function useMyFacilities(
  query: FacilityListQuery,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["facilities", "mine", query],
    queryFn: ({ signal }) =>
      facilitiesApi.listMine(query, token ?? undefined, signal),
    enabled,
    retry: false,
  });
}

export function useMyProducts(
  query: MerchantProductListQuery,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["facilities", "products", "mine", query],
    queryFn: ({ signal }) =>
      facilitiesApi.listMineProducts(query, token ?? undefined, signal),
    enabled,
    retry: false,
  });
}

export function useFacilityDetail(
  id: string | null,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["facilities", "detail", id],
    queryFn: ({ signal }) =>
      facilitiesApi.get(id!, token ?? undefined, signal),
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

export type FacilityMutationInput =
  | { kind: "create"; payload: unknown }
  | { kind: "edit"; id: string; payload: unknown }
  | { kind: "delete"; id: string }
  | { kind: "status"; id: string; status: string };

interface MutationOptions {
  token?: string;
  onSaved: (message: string) => void;
  onUnauthorized: () => void;
  onError?: (error: unknown) => void;
}

export function useFacilityMutation({
  token,
  onSaved,
  onUnauthorized,
  onError,
}: MutationOptions) {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async (input: FacilityMutationInput): Promise<unknown> => {
      switch (input.kind) {
        case "create":
          return facilitiesApi.create(input.payload, token);
        case "edit":
          return facilitiesApi.update(input.id, input.payload, token);
        case "delete":
          return facilitiesApi.remove(input.id, token);
        case "status":
          return facilitiesApi.update(input.id, { status: input.status }, token);
      }
    },
    onSuccess: (_data, input) => {
      cache.invalidateQueries({ queryKey: ["facilities"] });
      if (input.kind === "create") onSaved("Fasilitas berhasil didaftarkan.");
      else if (input.kind === "edit") onSaved("Perubahan fasilitas disimpan.");
      else if (input.kind === "delete") onSaved("Fasilitas dihapus.");
      else onSaved("Status fasilitas diperbarui.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
      else onError?.(error);
    },
  });
}

export function useProductMutation({
  token,
  onSaved,
  onUnauthorized,
  onError,
}: MutationOptions) {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async (
      input:
        | { facilityId: string; kind: "create"; payload: unknown }
        | { facilityId: string; kind: "edit"; id: string; payload: unknown }
        | { facilityId: string; kind: "delete"; id: string },
    ): Promise<unknown> => {
      switch (input.kind) {
        case "create":
          return facilitiesApi.addProduct(input.facilityId, input.payload, token);
        case "edit":
          return facilitiesApi.updateProduct(
            input.facilityId,
            input.id,
            input.payload,
            token,
          );
        case "delete":
          return facilitiesApi.removeProduct(input.facilityId, input.id, token);
      }
    },
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["facilities"] });
      onSaved("Produk diperbarui.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
      else onError?.(error);
    },
  });
}
