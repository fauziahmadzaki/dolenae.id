import { randomUUID } from "node:crypto";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AppConfig } from "../config/AppConfig";
import { ValidationError } from "../utils/errors";
import {
  IMAGE_EXTENSIONS,
  GALLERY_KEY_PATTERN,
  keyFromPublicUrl,
  matchesImageSignature,
} from "../utils/storage";
import type { UploadFile, UploadedImage } from "../types/upload";

class StorageService {
  private client: S3Client | null = null;

  private s3(): S3Client {
    if (this.client) return this.client;

    const config = AppConfig.load();
    this.client = new S3Client({
      region: config.s3Region,
      endpoint: config.s3Endpoint,
      forcePathStyle: config.s3ForcePathStyle,
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      },
    });
    return this.client;
  }

  private trimSlash(value: string): string {
    return value.replace(/\/+$/, "");
  }

  private s3Base(): string {
    return this.trimSlash(AppConfig.load().s3PublicUrl);
  }

  private localRoot(): string {
    return resolve(AppConfig.load().uploadDir);
  }

  private localBase(): string {
    return `${this.trimSlash(AppConfig.load().publicApiUrl)}/uploads`;
  }

  /** Upload an image and return its public URL plus object key. */
  async uploadImage(
    file: UploadFile,
    folder = "destinations",
  ): Promise<UploadedImage> {
    const config = AppConfig.load();
    const extension = IMAGE_EXTENSIONS[file.mimetype];

    if (!extension) {
      throw new ValidationError(
        "Format gambar harus JPEG, PNG, WebP, GIF, atau AVIF",
      );
    }
    if (!matchesImageSignature(file.buffer, file.mimetype)) {
      throw new ValidationError(
        "Isi file tidak cocok dengan tipe gambar yang dikirim",
      );
    }

    const key = `${folder}/${randomUUID()}.${extension}`;
    const meta = {
      key,
      name: file.originalname,
      size: file.size,
      mime: file.mimetype,
    };

    if (config.storageDriver === "local") {
      const target = join(this.localRoot(), key);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.buffer);
      return { ...meta, url: `${this.localBase()}/${key}` };
    }

    await this.s3().send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return { ...meta, url: `${this.s3Base()}/${key}` };
  }

  /** Public URL for an object key, using the configured storage driver. */
  publicUrlFor(key: string): string {
    const config = AppConfig.load();
    return config.storageDriver === "local"
      ? `${this.localBase()}/${key}`
      : `${this.s3Base()}/${key}`;
  }

  keyForPublicUrl(url: string): string | null {
    const config = AppConfig.load();
    const base = config.storageDriver === "local" ? this.localBase() : this.s3Base();
    return keyFromPublicUrl(url, base);
  }

  /** Gallery metadata comes from the stored object, not the registration request. */
  async galleryImageInfo(key: string): Promise<{ size: number; mime: string } | null> {
    if (!GALLERY_KEY_PATTERN.test(key) || key.includes("..")) return null;
    const mime = Object.keys(IMAGE_EXTENSIONS).find(
      (type) => key.endsWith(`.${IMAGE_EXTENSIONS[type]}`),
    );
    if (!mime) return null;
    const config = AppConfig.load();

    if (config.storageDriver === "local") {
      try {
        const info = await stat(join(this.localRoot(), key));
        return info.isFile() ? { size: info.size, mime } : null;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
    }

    try {
      const info = await this.s3().send(
        new HeadObjectCommand({ Bucket: config.s3Bucket, Key: key }),
      );
      return info.ContentType === mime && info.ContentLength !== undefined
        ? { size: info.ContentLength, mime }
        : null;
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      if (status === 404) return null;
      throw error;
    }
  }

  /**
   * Delete an image by key, restricted to one module folder (`gallery/`).
   * Traversal and absolute keys are refused before touching storage.
   */
  async deleteByKey(
    key: string,
  ): Promise<{ key: string; deleted: true }> {
    const config = AppConfig.load();
    const safe = key.trim();
    if (!GALLERY_KEY_PATTERN.test(safe) || safe.includes("..")) {
      throw new ValidationError("Kunci objek tidak valid untuk modul ini");
    }

    if (config.storageDriver === "local") {
      const root = this.localRoot();
      const target = resolve(root, safe);
      if (!target.startsWith(resolve(root) + sep)) {
        throw new ValidationError("Kunci objek di luar storage Dolenae");
      }
      await unlink(target).catch((error: unknown) => {
        const code = (error as { code?: string }).code;
        if (code !== "ENOENT") throw error;
      });
      return { key: safe, deleted: true };
    }

    await this.s3().send(
      new DeleteObjectCommand({ Bucket: config.s3Bucket, Key: safe }),
    );
    return { key: safe, deleted: true };
  }

  /** Delete an image, but only when the URL points to our own storage. */
  async deleteByUrl(url: string): Promise<{ key: string; deleted: true }> {
    const config = AppConfig.load();
    const key = this.keyForPublicUrl(url);
    if (!key || key.startsWith("gallery/")) {
      throw new ValidationError("URL gambar bukan milik folder unggahan ini");
    }

    if (config.storageDriver === "local") {
      await unlink(join(this.localRoot(), key)).catch((error: unknown) => {
        const code = (error as { code?: string }).code;
        if (code !== "ENOENT") throw error;
      });
      return { key, deleted: true };
    }

    await this.s3().send(
      new DeleteObjectCommand({ Bucket: config.s3Bucket, Key: key }),
    );

    return { key, deleted: true };
  }
}

export const storageService = new StorageService();
