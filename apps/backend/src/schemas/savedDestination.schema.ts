import { z } from "zod";

export const savedDestinationParamsSchema = z.object({
  destinationId: z.string().uuid("ID destinasi harus berupa UUID valid"),
});
