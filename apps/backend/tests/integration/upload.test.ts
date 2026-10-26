import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/db/client", () => ({
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  getPool: vi.fn(),
}));

vi.mock("../../src/services/storage.service", () => ({
  storageService: {
    uploadImage: vi.fn(),
    deleteByUrl: vi.fn(),
  },
}));

import { createApp } from "../../src/app";
import { storageService } from "../../src/services/storage.service";
import { signAccessToken } from "../../src/utils/jwt";
import { keyFromPublicUrl } from "../../src/utils/storage";

const app = createApp();

const adminId = "87654321-4321-4321-a321-1234567890ab";
const userId = "12345678-1234-4234-a234-1234567890ab";

// Minimal PNG header is enough for multer (magic bytes are checked in the
// storage service, which is mocked here).
const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

let adminToken = "";
let userToken = "";

beforeAll(async () => {
  adminToken = await signAccessToken({
    sub: adminId,
    email: "admin@dolenae.id",
    role: "admin",
  });
  userToken = await signAccessToken({
    sub: userId,
    email: "dimas@dolenae.id",
    role: "wisatawan",
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Uploads API (/api/uploads)", () => {
  it("requires authentication", async () => {
    const res = await request(app)
      .post("/api/uploads")
      .attach("file", png, { filename: "bromo.png", contentType: "image/png" });

    expect(res.status).toBe(401);
  });

  it("rejects non-admin users", async () => {
    const res = await request(app)
      .post("/api/uploads")
      .auth(userToken, { type: "bearer" })
      .attach("file", png, { filename: "bromo.png", contentType: "image/png" });

    expect(res.status).toBe(403);
  });

  it("rejects unsupported file types", async () => {
    const res = await request(app)
      .post("/api/uploads")
      .auth(adminToken, { type: "bearer" })
      .attach("file", Buffer.from("not an image"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(422);
    expect(res.body.error.message).toContain("Format gambar");
  });

  it("uploads an image and returns its public URL", async () => {
    vi.mocked(storageService.uploadImage).mockResolvedValueOnce({
      url: "http://localhost:9000/dolenae/destinations/abc.png",
      key: "destinations/abc.png",
      name: "bromo.png",
      size: png.length,
      mime: "image/png",
    });

    const res = await request(app)
      .post("/api/uploads?folder=destinations")
      .auth(adminToken, { type: "bearer" })
      .attach("file", png, { filename: "bromo.png", contentType: "image/png" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      key: "destinations/abc.png",
      mime: "image/png",
    });
    expect(storageService.uploadImage).toHaveBeenCalledWith(
      expect.objectContaining({ mimetype: "image/png" }),
      "destinations",
    );
  });

  it("deletes an uploaded image by URL", async () => {
    vi.mocked(storageService.deleteByUrl).mockResolvedValueOnce({
      key: "destinations/abc.png",
      deleted: true,
    });

    const url = encodeURIComponent(
      "http://localhost:9000/dolenae/destinations/abc.png",
    );
    const res = await request(app)
      .delete(`/api/uploads?url=${url}`)
      .auth(adminToken, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(storageService.deleteByUrl).toHaveBeenCalledWith(
      "http://localhost:9000/dolenae/destinations/abc.png",
    );
  });

  it("ignores URLs that are not served by our storage", () => {
    expect(
      keyFromPublicUrl(
        "https://example.com/photo.jpg",
        "http://localhost:9000/dolenae",
      ),
    ).toBeNull();
    expect(
      keyFromPublicUrl(
        "http://localhost:9000/dolenae/destinations/a.png",
        "http://localhost:9000/dolenae/",
      ),
    ).toBe("destinations/a.png");
  });
});
