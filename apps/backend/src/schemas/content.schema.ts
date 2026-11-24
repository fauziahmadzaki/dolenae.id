import { z } from "zod";
import { paginationSchema } from "../utils/pagination";
import { GALLERY_KEY_PATTERN } from "../utils/storage";

const urlSchema = z
  .string()
  .trim()
  .url("URL gambar tidak valid")
  .max(500);

const contentFields = {
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(180),
  kind: z.enum(["artikel", "panduan", "tips"]).default("artikel"),
  excerpt: z.string().trim().max(400).nullable().optional(),
  body: z.string().trim().min(10, "Isi konten minimal 10 karakter"),
  coverUrl: urlSchema.refine(
    (url) => /^https?:\/\//i.test(url),
    "Sampul harus berupa URL HTTP atau HTTPS",
  ).nullable().optional(),
  status: z.enum(["draft", "pending", "published"]).default("draft"),
};

/** Query for the admin content table (`GET /api/admin/contents`). */
export const contentListQuerySchema = paginationSchema.extend({
  kind: z.enum(["artikel", "panduan", "tips"]).optional(),
  status: z.enum(["draft", "pending", "published"]).optional(),
});

/** Query for the public article list (`GET /api/contents`). */
export const publicContentListQuerySchema = paginationSchema.extend({
  kind: z.enum(["artikel", "panduan", "tips"]).optional(),
});

export const createContentSchema = z.object(contentFields);

export const updateContentSchema = z
  .object({
    title: contentFields.title.optional(),
    kind: contentFields.kind.optional(),
    excerpt: contentFields.excerpt,
    body: contentFields.body.optional(),
    coverUrl: contentFields.coverUrl,
    status: contentFields.status.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi untuk update",
  );

export const contentIdParamsSchema = z.object({
  id: z.string().uuid("ID konten harus berupa format UUID yang valid"),
});

export const contentSlugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug tidak valid"),
});

/** Admin gallery list (`GET /api/admin/gallery`). */
export const galleryListQuerySchema = paginationSchema.extend({
  region: z.string().trim().max(120).optional(),
});

export const galleryIdParamsSchema = z.object({
  id: z.string().uuid("ID foto harus berupa format UUID yang valid"),
});

/**
 * Body of `POST /api/admin/gallery`: the client uploads the file first through
 * `/api/uploads?folder=gallery`, then registers the returned URL here.
 */
export const createGalleryPhotoSchema = z.object({
  url: urlSchema.optional(),
  key: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .regex(
      GALLERY_KEY_PATTERN,
      "Kunci foto harus file langsung di folder gallery/",
    ),
  name: z.string().trim().min(1).max(255),
  mime: z.string().trim().min(3).max(80),
  size: z.coerce.number().int().min(0).max(20 * 1024 * 1024),
  region: z.string().trim().max(120).nullable().optional(),
});

export const updateGalleryPhotoSchema = z
  .object({
    region: z.string().trim().max(120).nullable().optional(),
    name: z.string().trim().min(1).max(255).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi untuk update",
  );
