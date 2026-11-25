import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { galleryService } from "../services/GalleryService";
import type {
  CreateGalleryPhotoBody,
  GalleryIdParams,
  GalleryListQuery,
  UpdateGalleryPhotoBody,
} from "../types/gallery";
import { ok } from "../utils/response";

class GalleryController {
  /** GET /api/admin/gallery — admin photo grid with pagination. */
  list: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<GalleryListQuery>(req, "query");
      const result = await galleryService.list(query);
      ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/admin/gallery — register an uploaded photo. */
  create: RequestHandler = async (req, res, next) => {
    try {
      const body = getValidated<CreateGalleryPhotoBody>(req, "body");
      const photo = await galleryService.create(body, req.user?.id ?? null);
      ok(res, photo, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/admin/gallery/:id — rename a photo or set its region. */
  update: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<GalleryIdParams>(req, "params");
      const body = getValidated<UpdateGalleryPhotoBody>(req, "body");
      ok(res, await galleryService.update(params.id, body));
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/admin/gallery/:id — remove the row and the stored file. */
  delete: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<GalleryIdParams>(req, "params");
      ok(res, await galleryService.delete(params.id));
    } catch (err) {
      next(err);
    }
  };
}

export const galleryController = new GalleryController();
