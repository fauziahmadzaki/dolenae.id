"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiSettingsApi } from "../api/ai-settings";

export function useAiSettings(token: string | null | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "ai-settings"],
    queryFn: () => aiSettingsApi.get(token),
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
      aiSettingsApi.update(token, body),
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["admin", "ai-settings"] });
      onSaved();
    },
  });
}

export function useGeminiModels(token: string | null | undefined) {
  return useMutation({
    mutationFn: () => aiSettingsApi.models(token),
  });
}

export function useTestAi(token: string | null | undefined) {
  return useMutation({
    mutationFn: (prompt?: string) => aiSettingsApi.test(token, prompt),
  });
}
