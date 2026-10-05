import type { Context } from "hono";
import { storageService, ALLOWED_IMAGE_TYPES } from "../services/storage.service";
import { storageConfig } from "../config/env";
import { ok } from "../utils/response";
import { BadRequestError } from "../utils/errors";
import type { AppEnv } from "../types/auth";

const MAX_FOLDER_LEN = 40;

export const uploadController = {
  /**
   * POST /api/uploads — upload gambar (multipart, field `file`).
   * Query opsional: `folder` (prefix penyimpanan, mis. `destinations`).
   */
  async image(c: Context<AppEnv>) {
    const cfg = storageConfig();
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!(file instanceof File)) {
      throw new BadRequestError("File wajib diunggah pada field 'file'");
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new BadRequestError(
        `Tipe file '${file.type || "tidak dikenal"}' tidak didukung. Gunakan: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      );
    }
    if (file.size > cfg.maxUploadBytes) {
      throw new BadRequestError(
        `Ukuran file melebihi batas ${Math.round(cfg.maxUploadBytes / 1024 / 1024)} MB`,
      );
    }
    if (file.size === 0) {
      throw new BadRequestError("File kosong");
    }

    const folderRaw = c.req.query("folder");
    const folder = folderRaw ? folderRaw.slice(0, MAX_FOLDER_LEN) : "uploads";

    const buffer = new Uint8Array(await file.arrayBuffer());
    const stored = await storageService.putObject({
      buffer,
      contentType: file.type,
      folder,
      originalName: file.name,
    });

    return ok(
      c,
      {
        url: stored.url,
        key: stored.key,
        name: file.name,
        size: file.size,
        mime: file.type,
      },
      undefined,
      201,
    );
  },

  /**
   * DELETE /api/uploads?url=<publicUrl> — hapus file di storage.
   * Hanya URL dari base publik kita yang diproses.
   */
  async remove(c: Context<AppEnv>) {
    const url = c.req.query("url");
    if (!url) throw new BadRequestError("Parameter 'url' wajib ada");

    const key = storageService.keyFromUrl(url);
    if (!key) throw new BadRequestError("URL tidak dikenali sebagai file storage");

    await storageService.deleteObject(key);
    return ok(c, { deleted: true, key });
  },
};
