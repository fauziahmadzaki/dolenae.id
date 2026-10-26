import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { loadEnv } from "../config/env";
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

let client: S3Client | null = null;

function s3(): S3Client {
  if (client) return client;

  const env = loadEnv();
  client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

const trimSlash = (value: string) => value.replace(/\/+$/, "");
const s3Base = () => trimSlash(loadEnv().S3_PUBLIC_URL);
const localRoot = () => resolve(loadEnv().UPLOAD_DIR);
const localBase = () => `${trimSlash(loadEnv().PUBLIC_API_URL)}/uploads`;

export const storageService = {
  /** Upload an image and return its public URL plus object key. */
  async uploadImage(
    file: UploadFile,
    folder = "destinations",
  ): Promise<UploadedImage> {
    const env = loadEnv();
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

    if (env.STORAGE_DRIVER === "local") {
      const target = join(localRoot(), key);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.buffer);
      return { ...meta, url: `${localBase()}/${key}` };
    }

    await s3().send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return { ...meta, url: `${s3Base()}/${key}` };
  },

  /** Delete an image, but only when the URL points to our own storage. */
  async deleteByUrl(url: string): Promise<{ key: string; deleted: true }> {
    const env = loadEnv();

    if (env.STORAGE_DRIVER === "local") {
      const key = keyFromPublicUrl(url, localBase());
      if (!key) {
        throw new ValidationError("URL gambar bukan milik storage Dolenae");
      }

      await unlink(join(localRoot(), key)).catch((error: unknown) => {
        const code = (error as { code?: string }).code;
        if (code !== "ENOENT") throw error;
      });
      return { key, deleted: true };
    }

    const key = keyFromPublicUrl(url, env.S3_PUBLIC_URL);
    if (!key) {
      throw new ValidationError("URL gambar bukan milik storage Dolenae");
    }

    await s3().send(
      new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    );

    return { key, deleted: true };
  },
};
