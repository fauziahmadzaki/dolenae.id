"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth/hooks/auth-store";
import { aiSettingsApi } from "../api/ai-settings";

/**
 * Resolve the bearer token at request time. Reading from the store avoids a
 * stale `null` captured before the auth session is hydrated.
 */
const resolveToken = (token: string | null | undefined) =>
  token ?? useAuthStore.getState().token ?? undefined;

export function useAiSettings(token: string | null | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "ai-settings"],
    queryFn: () => aiSettingsApi.get(resolveToken(token)),
    enabled,
    retry: false,
  });
}

export function useUpdateAiSettings(
  token: string | null | undefined,
  onSaved: () => void,
) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (body: { apiKey?: string; model?: string }) =>
      aiSettingsApi.update(resolveToken(token), body),
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["admin", "ai-settings"] });
      onSaved();
    },
  });
}

export function useGeminiModels(token: string | null | undefined) {
  return useMutation({
    mutationFn: () => aiSettingsApi.models(resolveToken(token)),
  });
}

export function useTestAi(token: string | null | undefined) {
  return useMutation({
    mutationFn: (prompt?: string) =>
      aiSettingsApi.test(resolveToken(token), prompt),
  });
}
