"use client";

import { useQuery } from "@tanstack/react-query";
import { regionsApi } from "./api";

/** Provinces rarely change, so the lists are cached for the session. */
const STATIC = { staleTime: Number.POSITIVE_INFINITY, retry: false } as const;

export function useProvinces() {
  return useQuery({
    queryKey: ["regions", "provinces"],
    queryFn: ({ signal }) => regionsApi.provinces(signal),
    ...STATIC,
  });
}

export function useRegencies(provinceCode: string | undefined) {
  return useQuery({
    queryKey: ["regions", "regencies", provinceCode],
    queryFn: ({ signal }) => regionsApi.regencies(provinceCode!, signal),
    enabled: Boolean(provinceCode),
    ...STATIC,
  });
}

export function useDistricts(regencyCode: string | undefined) {
  return useQuery({
    queryKey: ["regions", "districts", regencyCode],
    queryFn: ({ signal }) => regionsApi.districts(regencyCode!, signal),
    enabled: Boolean(regencyCode),
    ...STATIC,
  });
}
