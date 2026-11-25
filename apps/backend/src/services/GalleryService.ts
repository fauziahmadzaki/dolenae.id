import type { GalleryPhotoRow } from "../db/models";
import {
  galleryRepository,
  type GalleryPhotoRowWithUploader,
} from "../repositories/GalleryRepository";
import { storageService } from "./StorageService";
import type {
  CreateGalleryPhotoBody,
  GalleryListQuery,
  PublicGalleryPhoto,
  UpdateGalleryPhotoBody,
} from "../types/gallery";
import type { ApiMeta } from "../types/api";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import { buildMeta, toPagination } from "../utils/pagination";
import { GALLERY_KEY_PATTERN } from "../utils/storage";

class GalleryService {
  private toPublic(row: GalleryPhotoRow): PublicGalleryPhoto {
    return {
      id: row.id,
      fileName: row.fileName,
      url: row.url,
      mime: row.mime,
      size: row.size,
      region: row.region,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private fromJoin(row: GalleryPhotoRowWithUploader): PublicGalleryPhoto {
    return this.toPublic(row.photo);
  }

  async list(
    query: GalleryListQuery,
  ): Promise<{ items: PublicGalleryPhoto[]; meta: ApiMeta }> {
    const pagination = toPagination(query);
    const { items, total } = await galleryRepository.list({
      ...pagination,
      region: query.region,
    });
    return {
      items: items.map((row) => this.fromJoin(row)),
      meta: buildMeta(total, query.page, query.limit),
    };
  }

  async getById(id: string): Promise<PublicGalleryPhoto> {
    const row = await galleryRepository.findById(id);
    if (!row) throw new NotFoundError("Foto tidak ditemukan");
    return this.toPublic(row);
  }

  /**
   * Register a photo the client uploaded through `/api/uploads?folder=gallery`.
   *
   * The caller's `url` is never trusted: the server derives the public URL from
   * the storage key, so a gallery row can only point at a gallery object that
   * actually exists in our storage.
   */
  async create(
    input: CreateGalleryPhotoBody,
    uploadedBy: string | null,
  ): Promise<PublicGalleryPhoto> {
    const key = input.key.trim();
    if (!GALLERY_KEY_PATTERN.test(key) || key.includes("..")) {
      throw new ValidationError(
        "Kunci foto harus berasal dari folder 'gallery'",
      );
    }
    return galleryRepository.withObjectLock(key, async (gallery) => {
      const stored = await storageService.galleryImageInfo(key);
      if (!stored) {
        throw new ValidationError("Berkas foto tidak ditemukan di storage; unggah ulang fotonya");
      }
      const existing = await gallery.findByKey(key);
      if (existing) return this.toPublic(existing);
      const row = await gallery.create({
        fileName: input.name,
        key,
        url: storageService.publicUrlFor(key),
        ...stored,
        region: input.region ?? null,
        uploadedBy,
      });
      return this.toPublic(row);
    });
  }

  async update(
    id: string,
    input: UpdateGalleryPhotoBody,
  ): Promise<PublicGalleryPhoto> {
    const patch: Parameters<typeof galleryRepository.update>[1] = {};
    if (input.name !== undefined) patch.fileName = input.name;
    if (input.region !== undefined) patch.region = input.region;

    const row = await galleryRepository.update(id, patch);
    if (!row) throw new NotFoundError("Foto tidak ditemukan");
    return this.toPublic(row);
  }

  /**
   * Delete the stored file first, using the row's own key, then the row.
   * A failed file delete leaves the row available for retry. Storage deletion
   * is idempotent, so a failed database commit can also be retried.
   */
  async delete(id: string): Promise<{ id: string; deleted: true }> {
    const row = await galleryRepository.findById(id);
    if (!row) return { id, deleted: true };
    if (!GALLERY_KEY_PATTERN.test(row.key) || row.key.includes("..")) {
      throw new ValidationError("Foto ini bukan milik modul galeri");
    }

    return galleryRepository.withObjectLock(row.key, async (gallery, content) => {
      const current = await gallery.findById(id);
      if (!current) return { id, deleted: true };
      if (await content.hasCover([current.url, storageService.publicUrlFor(current.key)])) {
        throw new ConflictError("Foto masih dipakai sebagai sampul artikel");
      }
      await storageService.deleteByKey(current.key);
      await gallery.delete(id);
      return { id, deleted: true };
    });
  }

  async discardUnregistered(key: string): Promise<{ key: string; deleted: true }> {
    return galleryRepository.withObjectLock(key, async (gallery, content) => {
      if (await gallery.findByKey(key)) {
        throw new ConflictError("Foto sudah tercatat. Hapus dari Galeri.");
      }
      if (await content.hasCover([storageService.publicUrlFor(key)])) {
        throw new ConflictError("Foto masih dipakai sebagai sampul artikel");
      }
      return storageService.deleteByKey(key);
    });
  }
}

export const galleryService = new GalleryService();
