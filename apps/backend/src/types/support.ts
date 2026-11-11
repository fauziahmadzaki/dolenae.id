import type { z } from "zod";
import type {
  supportIdParamsSchema,
  supportListQuerySchema,
} from "../schemas/support.schema";

export type SupportListQuery = z.infer<typeof supportListQuerySchema>;
export type SupportIdParams = z.infer<typeof supportIdParamsSchema>;
