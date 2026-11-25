import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from "../../src/app";
import { AppConfig } from "../../src/config/AppConfig";
import { contentRepository } from "../../src/repositories/ContentRepository";
import { galleryRepository } from "../../src/repositories/GalleryRepository";
import { storageService } from "../../src/services/StorageService";
import { signAccessToken } from "../../src/utils/jwt";

const ADMIN_ID = "87654321-4321-4321-a321-1234567890ab";
const CONTENT_ID = "11111111-1111-4111-a111-111111111111";
const PHOTO_ID = "22222222-2222-4222-a222-222222222222";

const baseContent = {
  id: CONTENT_ID,
  title: "Panduan Bromo",
  slug: "panduan-bromo",
  kind: "panduan" as const,
  excerpt: null,
  body: "Isi panduan mendaki yang cukup panjang untuk lolos validasi.",
  coverUrl: null,
  status: "draft" as const,
  authorId: ADMIN_ID,
  views: 0,
  publishedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const basePhoto = {
  id: PHOTO_ID,
  fileName: "bromo.png",
  key: "gallery/bromo.png",
  url: "http://localhost:3001/uploads/gallery/bromo.png",
  mime: "image/png",
  size: 1234,
  region: null,
  uploadedBy: ADMIN_ID,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("Admin content API (/api/admin/contents)", () => {
  const app = createApp();
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    adminToken = await signAccessToken({
      sub: ADMIN_ID,
      email: "admin@dolenae.id",
      role: "admin",
    });
    userToken = await signAccessToken({
      sub: "12345678-1234-4234-a234-1234567890ab",
      email: "wisatawan@dolenae.id",
      role: "wisatawan",
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects anonymous and non-admin callers", async () => {
    await request(app).get("/api/admin/contents").expect(401);
    await request(app)
      .get("/api/admin/contents")
      .set("authorization", `Bearer ${userToken}`)
      .expect(403);
  });

  it("lists content with author name and pagination meta", async () => {
    vi.spyOn(contentRepository, "list").mockResolvedValue({
      items: [{ content: baseContent, authorName: "Admin QA" }],
      total: 1,
    });

    const res = await request(app)
      .get("/api/admin/contents?limit=5&sort=updatedAt&order=desc")
      .set("authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0]).toMatchObject({
      id: CONTENT_ID,
      title: "Panduan Bromo",
      author: { id: ADMIN_ID, name: "Admin QA" },
      views: 0,
    });
  });

  it("creates content with a slug derived from the title", async () => {
    vi.spyOn(contentRepository, "slugExists").mockResolvedValue(false);
    vi.spyOn(contentRepository, "create").mockResolvedValue(baseContent);
    vi.spyOn(contentRepository, "findByIdWithAuthor").mockResolvedValue({
      content: baseContent,
      authorName: "Admin",
    });

    const res = await request(app)
      .post("/api/admin/contents")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        title: "Panduan Bromo",
        kind: "panduan",
        body: "Isi panduan mendaki yang cukup panjang untuk lolos validasi.",
        status: "draft",
      })
      .expect(201);

    expect(res.body.data.slug).toBe("panduan-bromo");
    expect(res.body.data.publishedAt).toBeNull();
  });

  it("stamps publishedAt when the status becomes published", async () => {
    vi.spyOn(contentRepository, "findById").mockResolvedValue(baseContent);
    vi.spyOn(contentRepository, "update").mockResolvedValue({
      ...baseContent,
      status: "published",
      publishedAt: new Date("2026-02-02T00:00:00Z"),
    });
    vi.spyOn(contentRepository, "findByIdWithAuthor").mockResolvedValue({
      content: {
        ...baseContent,
        status: "published",
        publishedAt: new Date("2026-02-02T00:00:00Z"),
      },
      authorName: "Admin",
    });

    const res = await request(app)
      .patch(`/api/admin/contents/${CONTENT_ID}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({ status: "published" })
      .expect(200);

    expect(res.body.data.status).toBe("published");
    expect(res.body.data.publishedAt).toBe("2026-02-02T00:00:00.000Z");
  });

  it("rejects a payload that fails validation", async () => {
    await request(app)
      .post("/api/admin/contents")
      .set("authorization", `Bearer ${adminToken}`)
      .send({ title: "x", kind: "artikel", body: "short", status: "draft" })
      .expect(422);
  });

  it("deletes content by id", async () => {
    vi.spyOn(contentRepository, "delete").mockResolvedValue(true);

    const res = await request(app)
      .delete(`/api/admin/contents/${CONTENT_ID}`)
      .set("authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data).toEqual({ id: CONTENT_ID, deleted: true });
  });
});

describe("Public content API (/api/contents)", () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists only published articles without auth", async () => {
    vi.spyOn(contentRepository, "list").mockResolvedValue({
      items: [
        {
          content: {
            ...baseContent,
            status: "published",
            publishedAt: new Date("2026-02-02T00:00:00Z"),
          },
          authorName: "Admin",
        },
      ],
      total: 1,
    });

    const res = await request(app).get("/api/contents?limit=5").expect(200);

    expect(res.body.data[0]).toMatchObject({ slug: "panduan-bromo" });
    expect(res.body.data[0].status).toBeUndefined();
  });

  it("returns 404 for a draft slug", async () => {
    vi.spyOn(contentRepository, "findPublishedBySlug").mockResolvedValue(undefined);

    await request(app).get("/api/contents/panduan-bromo").expect(404);
  });

  it("serves one published snapshot and counts the view", async () => {
    const read = vi.spyOn(contentRepository, "findPublishedBySlug").mockResolvedValue({
      content: { ...baseContent, status: "published", publishedAt: new Date("2026-02-02") },
      authorName: "Admin QA",
    });
    const count = vi.spyOn(contentRepository, "incrementViews").mockResolvedValue();
    const secondRead = vi.spyOn(contentRepository, "findByIdWithAuthor");
    const res = await request(app).get("/api/contents/panduan-bromo").expect(200);
    expect(res.body.data.body).toBe(baseContent.body);
    expect(read).toHaveBeenCalledOnce();
    expect(secondRead).not.toHaveBeenCalled();
    expect(count).toHaveBeenCalledWith(CONTENT_ID);
  });
});

describe("Admin gallery API (/api/admin/gallery)", () => {
  const app = createApp();
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await signAccessToken({
      sub: ADMIN_ID,
      email: "admin@dolenae.id",
      role: "admin",
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(galleryRepository, "withObjectLock").mockImplementation(
      async (_key, action) => action(galleryRepository, contentRepository),
    );
    vi.spyOn(contentRepository, "hasCover").mockResolvedValue(false);
    vi.spyOn(storageService, "publicUrlFor").mockReturnValue(basePhoto.url);
  });

  it("requires an admin token", async () => {
    await request(app).get("/api/admin/gallery").expect(401);
  });

  it("registers an uploaded gallery photo with the server-built URL", async () => {
    vi.spyOn(galleryRepository, "findByKey").mockResolvedValue(undefined);
    vi.spyOn(storageService, "galleryImageInfo").mockResolvedValue({ mime: basePhoto.mime, size: basePhoto.size });
    const create = vi.spyOn(galleryRepository, "create").mockResolvedValue(basePhoto);

    const res = await request(app)
      .post("/api/admin/gallery")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        // A caller-supplied URL is ignored in favour of the storage key.
        url: "https://evil.example.com/track.png",
        key: basePhoto.key,
        name: basePhoto.fileName,
        mime: "image/jpeg",
        size: 10,
      })
      .expect(201);

    expect(res.body.data).toMatchObject({ id: PHOTO_ID, fileName: "bromo.png" });
    expect(res.body.data.url).toBe(basePhoto.url);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ mime: basePhoto.mime, size: basePhoto.size }));
  });

  it("refuses a key whose object is missing from storage", async () => {
    vi.spyOn(galleryRepository, "findByKey").mockResolvedValue(undefined);
    vi.spyOn(storageService, "galleryImageInfo").mockResolvedValue(null);
    const create = vi.spyOn(galleryRepository, "create");

    await request(app)
      .post("/api/admin/gallery")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        key: "gallery/missing.png",
        name: "missing.png",
        mime: "image/png",
        size: 10,
      })
      .expect(422);

    expect(create).not.toHaveBeenCalled();
  });

  it("refuses keys outside the gallery folder", async () => {
    await request(app)
      .post("/api/admin/gallery")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        url: "http://localhost:3001/uploads/destinations/x.png",
        key: "destinations/x.png",
        name: "x.png",
        mime: "image/png",
        size: 10,
      })
      .expect(422);
  });

  it("refuses keys that try to walk out of the gallery folder", async () => {
    await request(app)
      .post("/api/admin/gallery")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        key: "gallery/../destinations/x.png",
        name: "x.png",
        mime: "image/png",
        size: 10,
      })
      .expect(422);
  });

  it("rejects non-admin callers on every gallery route", async () => {
    const userToken = await signAccessToken({
      sub: "12345678-1234-4234-a234-1234567890ab",
      email: "wisatawan@dolenae.id",
      role: "wisatawan",
    });

    await request(app)
      .get("/api/admin/gallery")
      .set("authorization", `Bearer ${userToken}`)
      .expect(403);
    await request(app)
      .post("/api/admin/gallery")
      .set("authorization", `Bearer ${userToken}`)
      .send({ key: "gallery/x.png", name: "x.png", mime: "image/png", size: 1 })
      .expect(403);
    await request(app)
      .patch(`/api/admin/gallery/${PHOTO_ID}`)
      .auth(userToken, { type: "bearer" })
      .send({ region: "Bali" })
      .expect(403);
    await request(app)
      .delete(`/api/admin/gallery/${PHOTO_ID}`)
      .set("authorization", `Bearer ${userToken}`)
      .expect(403);
  });

  it("deletes the stored file by key before removing the row", async () => {
    vi.spyOn(galleryRepository, "findById").mockResolvedValue(basePhoto);
    vi.spyOn(galleryRepository, "delete").mockResolvedValue(basePhoto);
    const remove = vi
      .spyOn(storageService, "deleteByKey")
      .mockResolvedValue({ key: basePhoto.key, deleted: true });

    const res = await request(app)
      .delete(`/api/admin/gallery/${PHOTO_ID}`)
      .set("authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.deleted).toBe(true);
    expect(remove).toHaveBeenCalledWith(basePhoto.key);
  });

  it("keeps the row when the stored file cannot be deleted", async () => {
    vi.spyOn(galleryRepository, "findById").mockResolvedValue(basePhoto);
    const drop = vi.spyOn(galleryRepository, "delete");
    vi.spyOn(storageService, "deleteByKey").mockRejectedValue(
      new Error("storage down"),
    );

    await request(app)
      .delete(`/api/admin/gallery/${PHOTO_ID}`)
      .set("authorization", `Bearer ${adminToken}`)
      .expect(500);

    expect(drop).not.toHaveBeenCalled();
  });

  it("reuses the registered row after a lost response and refuses discard", async () => {
    vi.spyOn(galleryRepository, "findByKey").mockResolvedValue(basePhoto);
    vi.spyOn(storageService, "galleryImageInfo").mockResolvedValue({ mime: basePhoto.mime, size: basePhoto.size });
    vi.spyOn(storageService, "keyForPublicUrl").mockReturnValue(basePhoto.key);
    const create = vi.spyOn(galleryRepository, "create");
    const remove = vi.spyOn(storageService, "deleteByKey");

    const response = await request(app).post("/api/admin/gallery")
      .auth(adminToken, { type: "bearer" })
      .send({ key: basePhoto.key, name: basePhoto.fileName, mime: basePhoto.mime, size: basePhoto.size })
      .expect(201);
    expect(response.body.data.id).toBe(PHOTO_ID);
    await request(app).delete("/api/uploads").query({ url: basePhoto.url })
      .auth(adminToken, { type: "bearer" }).expect(409);
    expect(create).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("registers a concurrent retry once under the same object lock", async () => {
    let queue = Promise.resolve();
    vi.mocked(galleryRepository.withObjectLock).mockImplementation(async (key, action) => {
      expect(key).toBe(basePhoto.key);
      const result = queue.then(() => action(galleryRepository, contentRepository));
      queue = result.then(() => undefined);
      return result;
    });
    let row: typeof basePhoto | undefined;
    vi.spyOn(galleryRepository, "findByKey").mockImplementation(async () => row);
    vi.spyOn(storageService, "galleryImageInfo").mockResolvedValue({ mime: basePhoto.mime, size: basePhoto.size });
    const create = vi.spyOn(galleryRepository, "create").mockImplementation(async () => {
      row = basePhoto;
      return row;
    });
    const register = () => request(app).post("/api/admin/gallery").auth(adminToken, { type: "bearer" })
      .send({ key: basePhoto.key, name: basePhoto.fileName, mime: basePhoto.mime, size: basePhoto.size })
      .expect(201);

    const results = await Promise.all([register(), register()]);
    expect(results.map((result) => result.body.data.id)).toEqual([PHOTO_ID, PHOTO_ID]);
    expect(create).toHaveBeenCalledOnce();
  });

  it("preserves referenced article covers through both deletion paths", async () => {
    vi.spyOn(galleryRepository, "findById").mockResolvedValue(basePhoto);
    vi.spyOn(galleryRepository, "findByKey").mockResolvedValue(undefined);
    vi.spyOn(storageService, "keyForPublicUrl").mockReturnValue(basePhoto.key);
    vi.mocked(contentRepository.hasCover).mockResolvedValue(true);
    const remove = vi.spyOn(storageService, "deleteByKey");

    await request(app).delete(`/api/admin/gallery/${PHOTO_ID}`)
      .auth(adminToken, { type: "bearer" }).expect(409);
    await request(app).delete("/api/uploads").query({ url: basePhoto.url })
      .auth(adminToken, { type: "bearer" }).expect(409);
    expect(galleryRepository.withObjectLock).toHaveBeenCalledTimes(2);
    expect(contentRepository.hasCover).toHaveBeenCalledWith([basePhoto.url]);
    expect(remove).not.toHaveBeenCalled();
  });

  it("allows admins to discard an unregistered and unused photo", async () => {
    vi.spyOn(galleryRepository, "findByKey").mockResolvedValue(undefined);
    vi.spyOn(storageService, "keyForPublicUrl").mockReturnValue(basePhoto.key);
    const remove = vi.spyOn(storageService, "deleteByKey")
      .mockResolvedValue({ key: basePhoto.key, deleted: true });

    await request(app).delete("/api/uploads").query({ url: basePhoto.url })
      .auth(adminToken, { type: "bearer" }).expect(200);
    expect(remove).toHaveBeenCalledWith(basePhoto.key);
  });

  it("can finish deleting the row when the first database attempt fails", async () => {
    vi.spyOn(galleryRepository, "findById").mockResolvedValue(basePhoto);
    const drop = vi.spyOn(galleryRepository, "delete")
      .mockRejectedValueOnce(new Error("DB temporarily unavailable"))
      .mockResolvedValueOnce(basePhoto);
    const remove = vi.spyOn(storageService, "deleteByKey")
      .mockResolvedValue({ key: basePhoto.key, deleted: true });

    await request(app).delete(`/api/admin/gallery/${PHOTO_ID}`)
      .auth(adminToken, { type: "bearer" }).expect(500);
    await request(app).delete(`/api/admin/gallery/${PHOTO_ID}`)
      .auth(adminToken, { type: "bearer" }).expect(200);
    vi.mocked(galleryRepository.findById).mockResolvedValue(undefined);
    await request(app).delete(`/api/admin/gallery/${PHOTO_ID}`)
      .auth(adminToken, { type: "bearer" }).expect(200);
    expect(drop).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it("refuses a new cover when the file is no longer available", async () => {
    vi.spyOn(storageService, "keyForPublicUrl").mockReturnValue(basePhoto.key);
    vi.spyOn(storageService, "galleryImageInfo").mockResolvedValue(null);
    vi.spyOn(contentRepository, "slugExists").mockResolvedValue(false);
    const create = vi.spyOn(contentRepository, "create");

    await request(app).post("/api/admin/contents").auth(adminToken, { type: "bearer" })
      .send({ title: baseContent.title, body: baseContent.body, coverUrl: basePhoto.url })
      .expect(422);
    expect(galleryRepository.withObjectLock).toHaveBeenCalledWith(basePhoto.key, expect.any(Function));
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses to delete a row that is not a gallery object", async () => {
    vi.spyOn(galleryRepository, "findById").mockResolvedValue({
      ...basePhoto,
      key: "destinations/bromo.png",
    });
    const drop = vi.spyOn(galleryRepository, "delete");

    await request(app)
      .delete(`/api/admin/gallery/${PHOTO_ID}`)
      .set("authorization", `Bearer ${adminToken}`)
      .expect(422);

    expect(drop).not.toHaveBeenCalled();
  });
});

it("reads and deletes a real image using an isolated local storage directory", async () => {
  vi.restoreAllMocks();
  const directory = await mkdtemp(join(tmpdir(), "dolenae-gallery-test-"));
  vi.spyOn(AppConfig.prototype, "storageDriver", "get").mockReturnValue("local");
  vi.spyOn(AppConfig.prototype, "uploadDir", "get").mockReturnValue(directory);
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/qwUAAAAASUVORK5CYII=",
    "base64",
  );
  try {
    const uploaded = await storageService.uploadImage(
      { originalname: "qa-fixture.png", mimetype: "image/png", size: png.length, buffer: png },
      "gallery",
    );
    expect(storageService.keyForPublicUrl(uploaded.url)).toBe(uploaded.key);
    await expect(storageService.galleryImageInfo(uploaded.key)).resolves.toEqual({
      mime: "image/png", size: png.length,
    });
    await storageService.deleteByKey(uploaded.key);
    await expect(storageService.galleryImageInfo(uploaded.key)).resolves.toBeNull();
    await expect(storageService.deleteByKey(uploaded.key)).resolves.toMatchObject({ deleted: true });
  } finally {
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  }
});
