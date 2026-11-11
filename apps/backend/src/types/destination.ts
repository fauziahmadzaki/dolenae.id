import type { z } from "zod";
import type {
  createDestinationSchema,
  destinationIdParamsSchema,
  destinationListQuerySchema,
  updateDestinationSchema,
} from "../schemas/destination.schema";

export type DestinationListQuery = z.infer<typeof destinationListQuerySchema>;
export type CreateDestinationBody = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationBody = z.infer<typeof updateDestinationSchema>;
export type DestinationIdParams = z.infer<typeof destinationIdParamsSchema>;
