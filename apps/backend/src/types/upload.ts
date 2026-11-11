import type { z } from "zod";
import type {
  deleteUploadQuerySchema,
  uploadQuerySchema,
} from "../schemas/upload.schema";

export type UploadQuery = z.infer<typeof uploadQuerySchema>;
export type DeleteUploadQuery = z.infer<typeof deleteUploadQuerySchema>;
