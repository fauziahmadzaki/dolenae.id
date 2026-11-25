import { jwtVerify, SignJWT } from "jose";
import { AppConfig } from "../config/AppConfig";
import type { JwtPayload, UserRole } from "../types/auth";
import { UnauthorizedError } from "./errors";

const ALG = "HS256";

function getSecret(): Uint8Array {
  return new TextEncoder().encode(AppConfig.load().jwtSecret);
}

/** Sign a short-lived access token for a user. */
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(AppConfig.load().jwtExpiresIn)
    .sign(getSecret());
}

/** Verify an access token and return its claims; throws 401 when invalid. */
export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
    });

    const { sub, email, role } = payload;
    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      throw new UnauthorizedError("Token tidak valid");
    }

    return { sub, email, role: role as UserRole };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Sesi tidak valid atau sudah kedaluwarsa");
  }
}
