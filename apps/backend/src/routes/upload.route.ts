import { Router, type RequestHandler } from "express";
import multer from "multer";
import { AppConfig } from "../config/AppConfig";
import { uploadController } from "../controllers/UploadController";
import {
  deleteUploadQuerySchema,
  uploadQuerySchema,
} from "../schemas/upload.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { getValidated, validate } from "../middleware/validate";
import type { UploadQuery } from "../types/upload";
import { ValidationError } from "../utils/errors";
import { ALLOWED_IMAGE_TYPES } from "../utils/storage";

const maxBytes = AppConfig.load().maxUploadMb * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      callback(
        new ValidationError(
          "Format gambar harus JPEG, PNG, WebP, GIF, atau AVIF",
        ),
      );
      return;
    }
    callback(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.use(authRequired);

const galleryUploadOnly: RequestHandler = (req, res, next) => {
  if (getValidated<UploadQuery>(req, "query").folder !== "gallery") {
    next();
    return;
  }
  requireRole("admin")(req, res, next);
};

uploadRouter.post(
  "/",
  requireRole("admin", "merchant"),
  validate({ query: uploadQuerySchema }),
  galleryUploadOnly,
  upload.single("file"),
  uploadController.create,
);

uploadRouter.delete(
  "/",
  requireRole("admin", "merchant"),
  validate({ query: deleteUploadQuerySchema }),
  uploadController.remove,
);
