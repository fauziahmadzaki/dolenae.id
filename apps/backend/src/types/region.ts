import type { z } from "zod";
import type {
  districtQuerySchema,
  regencyQuerySchema,
  reverseQuerySchema,
} from "../schemas/region.schema";

export type RegencyQuery = z.infer<typeof regencyQuerySchema>;
export type DistrictQuery = z.infer<typeof districtQuerySchema>;
export type ReverseQuery = z.infer<typeof reverseQuerySchema>;
