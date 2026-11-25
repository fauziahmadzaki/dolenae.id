import type { z } from "zod";
import type {
  GalleryPhotoRow,
  NewGalleryPhotoRow,
} from "../db/models";
import type {
  createGalleryPhotoSchema,
  galleryIdParamsSchema,
  galleryListQuerySchema,
  updateGalleryPhotoSchema,
} from "../schemas/content.schema";
import type { Pagination } from "../utils/pagination";

export type GalleryListQuery = z.infer<typeof galleryListQuerySchema>;
export type CreateGalleryPhotoBody = z.infer<typeof createGalleryPhotoSchema>;
export type UpdateGalleryPhotoBody = z.infer<typeof updateGalleryPhotoSchema>;
export type GalleryIdParams = z.infer<typeof galleryIdParamsSchema>;

export type GalleryListParams = Pagination & { region?: string };

export type GalleryPhotoPatch = Partial<
  Pick<NewGalleryPhotoRow, "fileName" | "region">
>;

/** Gallery photo shape sent to the admin grid. */
export interface PublicGalleryPhoto {
  id: string;
  fileName: string;
  url: string;
  mime: string;
  size: number;
  region: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GalleryPhotoWithUploaderRow = {
  photo: GalleryPhotoRow;
  uploaderName: string | null;
};
