import { z } from "zod";

/** Upload target folder; only known folders are accepted. */
export const uploadQuerySchema = z.object({
  folder: z.enum(["destinations", "nodes"]).default("destinations"),
});

/** Delete by public URL — validated by storageService before deleting. */
export const deleteUploadQuerySchema = z.object({
  url: z.string().trim().url("URL gambar tidak valid"),
});

export type UploadQuery = z.infer<typeof uploadQuerySchema>;
export type DeleteUploadQuery = z.infer<typeof deleteUploadQuerySchema>;
