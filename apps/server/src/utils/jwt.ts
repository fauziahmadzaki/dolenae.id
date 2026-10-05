import { sign, verify } from "hono/jwt";
import { loadEnv } from "../config/env";
import type { AuthTokenPayload } from "../types/auth";
import { UnauthorizedError } from "./errors";

/** Buat access token dari payload. */
export async function issueToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
): Promise<string> {
  const env = loadEnv();
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = parseExpiry(env.JWT_EXPIRES_IN);

  return sign(
    { ...payload, iat: now, exp: now + expiresIn },
    env.JWT_SECRET,
    "HS256",
  );
}

/** Verifikasi token; melempar UnauthorizedError bila tidak valid/kadaluarsa. */
export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  const env = loadEnv();
  try {
    const decoded = (await verify(token, env.JWT_SECRET, "HS256")) as unknown;
    return decoded as AuthTokenPayload;
  } catch {
    throw new UnauthorizedError("Token tidak valid atau sudah kedaluwarsa");
  }
}

/** Konversi durasi sederhana ("7d", "12h", "30m", "60s") ke detik. */
function parseExpiry(input: string): number {
  const match = /^(\d+)([smhd])?$/.exec(input.trim());
  if (!match) return 7 * 24 * 60 * 60; // default 7 hari

  const value = Number(match[1]);
  switch (match[2]) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
    default:
      return value * 24 * 60 * 60;
  }
}
