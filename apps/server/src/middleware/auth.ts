import type { MiddlewareHandler } from "hono";
import { verifyToken } from "../utils/jwt";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";
import type { AuthUser } from "../types/auth";
import type { AppEnv } from "../types/auth";
import type { UserRole } from "@dolenae/types";

/** Ambil bearer token dari header Authorization. */
function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

/**
 * Middleware auth wajib: verifikasi JWT lalu set `c.set('user', ...)`.
 * Lempar UnauthorizedError bila tidak ada / tidak valid.
 */
export const authRequired = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const token = extractBearer(c.req.header("authorization"));
  if (!token) {
    throw new UnauthorizedError("Header Authorization: Bearer <token> wajib ada");
  }

  const payload = await verifyToken(token);
  const user: AuthUser = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
  c.set("user", user);
  await next();
};

/** Middleware pembatas role; dipakai setelah `authRequired`. */
export const requireRole =
  (...roles: UserRole[]): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    const user = c.get("user");
    if (!user) throw new UnauthorizedError();
    if (!roles.includes(user.role)) {
      throw new ForbiddenError(
        `Butuh role: ${roles.join(", ")}`,
      );
    }
    await next();
  };
