import { AppConfig } from "../config/AppConfig";
import { settingsRepository } from "../repositories/settings.repository";
import {
  decryptSecret,
  encryptSecret,
  maskSecret,
} from "../utils/crypto";

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

class SettingsService {
  private static readonly API_KEY_SETTING = "gemini.api_key";
  private static readonly MODEL_SETTING = "gemini.model";
  private static readonly CACHE_TTL_MS = 60_000;

  private static cache: { value: GeminiConfig; at: number } | null = null;

  private static invalidate(): void {
    SettingsService.cache = null;
  }

  async getGeminiConfig(): Promise<GeminiConfig> {
    if (
      SettingsService.cache &&
      Date.now() - SettingsService.cache.at < SettingsService.CACHE_TTL_MS
    ) {
      return SettingsService.cache.value;
    }

    const config = AppConfig.load();
    const rows = await settingsRepository.findMany([
      SettingsService.API_KEY_SETTING,
      SettingsService.MODEL_SETTING,
    ]);
    const keyRow = rows.find(
      (row) => row.key === SettingsService.API_KEY_SETTING,
    );
    const modelRow = rows.find(
      (row) => row.key === SettingsService.MODEL_SETTING,
    );

    const value: GeminiConfig = {
      apiKey: keyRow ? decryptSecret(keyRow.value) : config.geminiApiKey,
      model: modelRow?.value || config.aiModel,
      source: keyRow ? "db" : "env",
    };

    SettingsService.cache = { value, at: Date.now() };
    return value;
  }

  async getPublicAiSettings(): Promise<PublicAiSettings> {
    const config = await this.getGeminiConfig();
    const keyRow = await settingsRepository.findWithUser(
      SettingsService.API_KEY_SETTING,
    );
    const modelRow = await settingsRepository.findWithUser(
      SettingsService.MODEL_SETTING,
    );
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
  }

  async saveAiSettings(input: {
    apiKey?: string;
    model?: string;
    updatedBy: string;
  }): Promise<PublicAiSettings> {
    const apiKey = input.apiKey?.trim();
    const model = input.model?.trim();

    if (apiKey) {
      await settingsRepository.upsert({
        key: SettingsService.API_KEY_SETTING,
        value: encryptSecret(apiKey),
        encrypted: true,
        updatedBy: input.updatedBy,
      });
    }
    if (model) {
      await settingsRepository.upsert({
        key: SettingsService.MODEL_SETTING,
        value: model,
        encrypted: false,
        updatedBy: input.updatedBy,
      });
    }

    SettingsService.invalidate();
    return this.getPublicAiSettings();
  }

  async clearApiKey(_updatedBy: string): Promise<PublicAiSettings> {
    await settingsRepository.remove(SettingsService.API_KEY_SETTING);
    SettingsService.invalidate();
    return this.getPublicAiSettings();
  }
}

export const settingsService = new SettingsService();
