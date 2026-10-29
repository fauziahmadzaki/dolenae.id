import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { loadEnv } from "../config/env";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer {
  const key = Buffer.from(loadEnv().APP_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) {
    throw new Error("APP_ENCRYPTION_KEY must be a 32-byte base64 value");
  }
  return key;
}

/** Encrypt a secret with AES-256-GCM (`v1:iv:tag:cipher`, all base64). */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/** Decrypt a payload produced by [encryptSecret]. */
export function decryptSecret(payload: string): string {
  const [version, ivBase64, tagBase64, dataBase64] = payload.split(":");
  if (version !== VERSION || !ivBase64 || !tagBase64 || !dataBase64) {
    throw new Error("Format secret tidak valid");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(),
    Buffer.from(ivBase64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataBase64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/** Mask a secret for admin responses: `••••••ab12`. */
export function maskSecret(value: string): string {
  const visible = value.slice(-4);
  return `••••••${visible}`;
}
