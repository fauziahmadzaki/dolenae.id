import { z } from "zod";
import { paginationSchema } from "../utils/pagination";

import { BadRequestError } from "../utils/errors";

export const supportIdParamsSchema = z.object({
  id: z.unknown().transform((value) => {
    const result = z.string().uuid().safeParse(value);
    if (!result.success) throw new BadRequestError("ID harus UUID yang valid");
    return result.data;
  }),
});
export const supportListQuerySchema = paginationSchema.pick({ page: true, limit: true });
export type SupportListQuery = z.infer<typeof supportListQuerySchema>;
