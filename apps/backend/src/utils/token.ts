import { createHash, randomBytes } from "node:crypto";

/** Random hex token handed to the user (e.g. via a password-reset link). */
export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("hex");
}

/** SHA-256 hex digest; used to store tokens without keeping the raw value. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
