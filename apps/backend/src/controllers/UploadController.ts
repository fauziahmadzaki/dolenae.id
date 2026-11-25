import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { storageService } from "../services/StorageService";
import { galleryService } from "../services/GalleryService";
import { ForbiddenError, ValidationError } from "../utils/errors";
import { ok } from "../utils/response";
import type { DeleteUploadQuery, UploadQuery } from "../types/upload";

class UploadController {
  /** POST /api/uploads — admin uploads one image (multipart field `file`). */
  create: RequestHandler = async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ValidationError(
          "File gambar wajib dikirim pada field 'file'",
        );
      }

      const { folder } = getValidated<UploadQuery>(req, "query");
      const image = await storageService.uploadImage(req.file, folder);

      ok(res, image, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/uploads?url= — admin removes an uploaded image. */
  remove: RequestHandler = async (req, res, next) => {
    try {
      const { url } = getValidated<DeleteUploadQuery>(req, "query");
      const key = storageService.keyForPublicUrl(url);
      if (!key) throw new ValidationError("URL gambar bukan milik storage Dolenae");
      const isGallery = key.startsWith("gallery/");
      if (isGallery && req.user?.role !== "admin") throw new ForbiddenError();
      const result = isGallery
        ? await galleryService.discardUnregistered(key)
        : await storageService.deleteByUrl(url);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const uploadController = new UploadController();
