import { get, post, put } from "~/lib/api/client";

export interface AiSettings {
  hasKey: boolean;
  keyPreview: string | null;
  model: string;
  source: "db" | "env";
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface GeminiModel {
  id: string;
  displayName: string;
  description: string;
}

export interface AiTestResult {
  text: string;
  model: string;
  latencyMs: number;
}

const auth = (token?: string | null) => ({ token: token ?? undefined });

export const aiSettingsApi = {
  get: (token?: string | null) =>
    get<AiSettings>("/admin/ai/settings", auth(token)),

  update: (
    token: string | null | undefined,
    body: { apiKey?: string; model?: string },
  ) => put<AiSettings>("/admin/ai/settings", body, auth(token)),

  models: (token?: string | null) =>
    get<GeminiModel[]>("/admin/ai/models", auth(token)),

  test: (token: string | null | undefined, prompt?: string) =>
    post<AiTestResult>("/admin/ai/test", { prompt }, auth(token)),
};
