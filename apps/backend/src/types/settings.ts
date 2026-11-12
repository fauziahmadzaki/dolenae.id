import type { AppSettingRow } from "../db/models";

/** App setting row joined with the name of the user who last updated it. */
export interface AppSettingWithUser extends AppSettingRow {
  updatedByName: string | null;
}

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
