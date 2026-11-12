import type { z } from "zod";
import type { TravelSupportRow } from "../db/models";
import type {
  supportIdParamsSchema,
  supportListQuerySchema,
} from "../schemas/support.schema";

export type SupportListQuery = z.infer<typeof supportListQuerySchema>;
export type SupportIdParams = z.infer<typeof supportIdParamsSchema>;

/** Travel support row joined with its destination name. */
export type JoinedTravelSupport = TravelSupportRow & {
  relatedDestinationName: string;
};

export type PublicTravelSupport = Omit<
  JoinedTravelSupport,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};
