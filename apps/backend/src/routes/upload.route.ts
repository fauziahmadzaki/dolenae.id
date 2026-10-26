import { Router } from "express";
import multer from "multer";
import { loadEnv } from "../config/env";
import { uploadController } from "../controllers/upload.controller";
import {
  deleteUploadQuerySchema,
  uploadQuerySchema,
} from "../controllers/upload.schema";
import { authRequired, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ValidationError } from "../utils/errors";
import { ALLOWED_IMAGE_TYPES } from "../utils/storage";

const maxBytes = loadEnv().MAX_UPLOAD_MB * 1024 * 1024;

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

uploadRouter.use(authRequired, requireRole("admin"));

uploadRouter.post(
  "/",
  validate({ query: uploadQuerySchema }),
  upload.single("file"),
  uploadController.create,
);

uploadRouter.delete(
  "/",
  validate({ query: deleteUploadQuerySchema }),
  uploadController.remove,
);
