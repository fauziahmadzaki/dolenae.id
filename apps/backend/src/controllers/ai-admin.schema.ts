import { z } from "zod";

const apiKeySchema = z.string().trim().min(20, "API key tidak valid").max(200);
const modelSchema = z.string().trim().min(3, "Pilih model").max(80);

export const updateAiSettingsSchema = z
  .object({
    apiKey: apiKeySchema.optional(),
    model: modelSchema.optional(),
  })
  .refine(
    (data) => data.apiKey !== undefined || data.model !== undefined,
    "Isi API key atau pilih model",
  );

export const testAiSchema = z.object({
  prompt: z.string().trim().max(500).optional(),
});

export type UpdateAiSettingsBody = z.infer<typeof updateAiSettingsSchema>;
export type TestAiBody = z.infer<typeof testAiSchema>;
