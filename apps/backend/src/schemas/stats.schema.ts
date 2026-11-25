import { z } from "zod";

export const statsQuerySchema = z.object({
  months: z.coerce.number().int().min(3).max(24).default(12),
});
