"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../api";

export function useDashboardStats(
  months: number,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["admin-stats", months],
    queryFn: ({ signal }) =>
      fetchDashboardStats(months, token ?? undefined, signal),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}
