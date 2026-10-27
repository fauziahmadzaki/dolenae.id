"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Destination, DestinationDetail } from "~/types/domain";
import {
  categoriesApi,
  destinationsApi,
  type DestinationListQuery,
} from "../api/destinations";

export function useCategories(enabled: boolean) {
  return useQuery({
    queryKey: ["categories", "all"],
    queryFn: ({ signal }) => categoriesApi.list(signal),
    enabled,
    retry: false,
  });
}

export function useDestinations(
  query: DestinationListQuery,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["destinations", query],
    queryFn: ({ signal }) =>
      destinationsApi.list(query, token ?? undefined, signal),
    enabled,
    retry: false,
  });
}

interface DeleteOptions {
  token?: string;
  onDeleted?: () => void;
}

export function useDeleteDestination({ token, onDeleted }: DeleteOptions) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (destination: Destination) =>
      destinationsApi.remove(destination.id, token),
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["destinations"] });
      onDeleted?.();
    },
  });
}

export function useDestination(
  id: string | undefined,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["destination", id],
    queryFn: ({ signal }) =>
      destinationsApi.get(id!, token ?? undefined, signal),
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

interface SaveOptions {
  editing: boolean;
  id?: string;
  token?: string;
  onSaved?: (destination: DestinationDetail) => void;
}

export function useSaveDestination({
  editing,
  id,
  token,
  onSaved,
}: SaveOptions) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      editing
        ? destinationsApi.update(id!, payload, token)
        : destinationsApi.create(payload, token),
    onSuccess: (result) => {
      cache.invalidateQueries({ queryKey: ["destinations"] });
      cache.invalidateQueries({ queryKey: ["destination", id] });
      onSaved?.(result.data);
    },
  });
}
