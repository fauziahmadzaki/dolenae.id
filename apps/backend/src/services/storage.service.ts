import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AppConfig } from "../config/AppConfig";
import { ValidationError } from "../utils/errors";
import {
  IMAGE_EXTENSIONS,
  keyFromPublicUrl,
  matchesImageSignature,
} from "../utils/storage";

export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadedImage {
  url: string;
  key: string;
  name: string;
  size: number;
  mime: string;
}

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

  /** Delete an image, but only when the URL points to our own storage. */
  async deleteByUrl(url: string): Promise<{ key: string; deleted: true }> {
    const config = AppConfig.load();

    if (config.storageDriver === "local") {
      const key = keyFromPublicUrl(url, this.localBase());
      if (!key) {
        throw new ValidationError("URL gambar bukan milik storage Dolenae");
      }

      await unlink(join(this.localRoot(), key)).catch((error: unknown) => {
        const code = (error as { code?: string }).code;
        if (code !== "ENOENT") throw error;
      });
      return { key, deleted: true };
    }

    const key = keyFromPublicUrl(url, config.s3PublicUrl);
    if (!key) {
      throw new ValidationError("URL gambar bukan milik storage Dolenae");
    }

    await this.s3().send(
      new DeleteObjectCommand({ Bucket: config.s3Bucket, Key: key }),
    );

    return { key, deleted: true };
  }
}

export const storageService = new StorageService();
