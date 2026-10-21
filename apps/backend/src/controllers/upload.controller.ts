import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { storageService } from "../services/storage.service";
import { ValidationError } from "../utils/errors";
import { ok } from "../utils/response";
import type { DeleteUploadQuery, UploadQuery } from "./upload.schema";

export const uploadController = {
  /** POST /api/uploads — admin uploads one image (multipart field `file`). */
  create: (async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ValidationError(
          "File gambar wajib dikirim pada field 'file'",
        );
      }

      const { folder } = getValidated<UploadQuery>(req, "query");
      const image = await storageService.uploadImage(req.file, folder);

      return ok(res, image, undefined, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** DELETE /api/uploads?url= — admin removes an uploaded image. */
  remove: (async (req, res, next) => {
    try {
      const { url } = getValidated<DeleteUploadQuery>(req, "query");
      const result = await storageService.deleteByUrl(url);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
