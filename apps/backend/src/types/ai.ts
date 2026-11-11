import type { z } from "zod";
import type {
  aiItinerarySchema,
} from "../schemas/ai.schema";
import type {
  testAiSchema,
  updateAiSettingsSchema,
} from "../schemas/ai-admin.schema";

export type AiItineraryBody = z.infer<typeof aiItinerarySchema>;
export type UpdateAiSettingsBody = z.infer<typeof updateAiSettingsSchema>;
export type TestAiBody = z.infer<typeof testAiSchema>;
