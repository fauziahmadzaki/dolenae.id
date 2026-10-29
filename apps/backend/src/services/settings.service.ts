import { loadEnv } from "../config/env";
import { settingsRepository } from "../repositories/settings.repository";
import {
  decryptSecret,
  encryptSecret,
  maskSecret,
} from "../utils/crypto";

const API_KEY_SETTING = "gemini.api_key";
const MODEL_SETTING = "gemini.model";
const CACHE_TTL_MS = 60_000;

export interface GeminiConfig {
  apiKey: string;
  model: string;
  source: "db" | "env";
}

export interface PublicAiSettings {
  hasKey: boolean;
  keyPreview: string | null;
  model: string;
  source: "db" | "env";
  updatedAt: string | null;
  updatedBy: string | null;
}

let cache: { value: GeminiConfig; at: number } | null = null;

const invalidate = () => {
  cache = null;
};

export const settingsService = {
  async getGeminiConfig(): Promise<GeminiConfig> {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

    const env = loadEnv();
    const rows = await settingsRepository.findMany([
      API_KEY_SETTING,
      MODEL_SETTING,
    ]);
    const keyRow = rows.find((row) => row.key === API_KEY_SETTING);
    const modelRow = rows.find((row) => row.key === MODEL_SETTING);

    const value: GeminiConfig = {
      apiKey: keyRow ? decryptSecret(keyRow.value) : env.GEMINI_API_KEY,
      model: modelRow?.value || env.AI_MODEL,
      source: keyRow ? "db" : "env",
    };

    cache = { value, at: Date.now() };
    return value;
  },

  async getPublicAiSettings(): Promise<PublicAiSettings> {
    const config = await this.getGeminiConfig();
    const keyRow = await settingsRepository.findWithUser(API_KEY_SETTING);
    const modelRow = await settingsRepository.findWithUser(MODEL_SETTING);
    const latest =
      [keyRow, modelRow]
        .filter((row): row is NonNullable<typeof row> => Boolean(row))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] ??
      null;

    return {
      hasKey: config.apiKey.length > 0,
      keyPreview: config.apiKey ? maskSecret(config.apiKey) : null,
      model: config.model,
      source: config.source,
      updatedAt: latest?.updatedAt.toISOString() ?? null,
      updatedBy: latest?.updatedByName ?? null,
    };
  },

  async saveAiSettings(input: {
    apiKey?: string;
    model?: string;
    updatedBy: string;
  }): Promise<PublicAiSettings> {
    const apiKey = input.apiKey?.trim();
    const model = input.model?.trim();

    if (apiKey) {
      await settingsRepository.upsert({
        key: API_KEY_SETTING,
        value: encryptSecret(apiKey),
        encrypted: true,
        updatedBy: input.updatedBy,
      });
    }
    if (model) {
      await settingsRepository.upsert({
        key: MODEL_SETTING,
        value: model,
        encrypted: false,
        updatedBy: input.updatedBy,
      });
    }

    invalidate();
    return this.getPublicAiSettings();
  },

  async clearApiKey(_updatedBy: string): Promise<PublicAiSettings> {
    await settingsRepository.remove(API_KEY_SETTING);
    invalidate();
    return this.getPublicAiSettings();
  },
};
