import { z } from "zod";

const stringList = (maxItems: number, maxLength: number) =>
  z
    .array(z.string().trim().min(1).max(maxLength))
    .max(maxItems)
    .optional();

/** Preferences sent by the mobile AI screen. */
export const aiItinerarySchema = z.object({
  rawText: z.string().trim().max(1000).optional(),
  regions: stringList(5, 80),
  activities: stringList(8, 80),
  terrains: stringList(8, 80),
  difficulty: z.enum(["ramah-pemula", "menengah", "sulit"]).optional(),
  durationDays: z.coerce.number().int().min(1).max(7).optional(),
  budgetPerPerson: z.coerce
    .number()
    .int()
    .min(0)
    .max(1_000_000_000)
    .optional(),
  needsAccommodation: z.boolean().optional(),
  needsTransport: z.boolean().optional(),
  note: z.string().trim().max(500).optional(),
  /** Skip the 24h response cache when the user explicitly asks again. */
  refresh: z.boolean().optional(),
});

export type AiItineraryBody = z.infer<typeof aiItinerarySchema>;
