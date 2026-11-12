import type { z } from "zod";
import type {
  deleteUploadQuerySchema,
  uploadQuerySchema,
} from "../schemas/upload.schema";

export type UploadQuery = z.infer<typeof uploadQuerySchema>;
export type DeleteUploadQuery = z.infer<typeof deleteUploadQuerySchema>;

export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadedImage {
  url: string;
  key: string;
  name: string;
  size: number;
  mime: string;
}
