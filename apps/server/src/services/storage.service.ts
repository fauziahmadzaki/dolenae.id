import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { storageConfig } from "../config/env";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** Content-type gambar yang diizinkan untuk upload. */
export const ALLOWED_IMAGE_TYPES = Object.keys(MIME_EXT);

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    const cfg = storageConfig();
    client = new S3Client({
      endpoint: cfg.endpoint,
      region: cfg.region,
      forcePathStyle: cfg.forcePathStyle,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }
  return client;
}

function extFor(mime: string, fallbackName?: string): string {
  const known = MIME_EXT[mime];
  if (known) return known;
  const fromName = fallbackName?.split(".").pop()?.toLowerCase();
  return fromName && /^[a-z0-9]{1,5}$/.test(fromName) ? fromName : "bin";
}

export interface PutObjectInput {
  buffer: Uint8Array;
  contentType: string;
  /** Prefix folder, mis. "destinations" / "supports". */
  folder?: string;
  /** Nama asli (hanya untuk mengambil ekstensi). */
  originalName?: string;
}

export interface StoredObject {
  key: string;
  url: string;
}

/**
 * Object storage S3-compatible (MinIO self-host / R2 / S3).
 * Nama file acak + prefix waktu agar rapi & tidak bentrok.
 */
export const storageService = {
  buildKey(folder: string | undefined, mime: string, originalName?: string): string {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const safeFolder = (folder ?? "uploads").replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
    return `${safeFolder}/${yyyy}/${mm}/${randomUUID()}.${extFor(mime, originalName)}`;
  },

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const cfg = storageConfig();
    const key = this.buildKey(input.folder, input.contentType, input.originalName);
    await getClient().send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
      }),
    );
    return { key, url: `${cfg.publicUrl}/${key}` };
  },

  async deleteObject(key: string): Promise<void> {
    const cfg = storageConfig();
    await getClient().send(
      new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }),
    );
  },

  /** Ambil key dari URL publik (mis. .../dolenae/destinations/... → destinations/...). */
  keyFromUrl(url: string): string | null {
    const cfg = storageConfig();
    const prefix = `${cfg.publicUrl}/`;
    if (!url.startsWith(prefix)) return null;
    const key = url.slice(prefix.length).split("?")[0];
    return key || null;
  },
};
