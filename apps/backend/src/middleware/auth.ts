import type { RequestHandler } from "express";
import type { UserRole } from "../types/auth";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

/** Require a valid `Authorization: Bearer <token>` header; attaches `req.user`. */
export const authRequired: RequestHandler = async (req, _res, next) => {
  try {
    const [scheme, token] = (req.header("authorization") ?? "").split(" ");
    if (!token || scheme?.toLowerCase() !== "bearer") {
      throw new UnauthorizedError("Header Authorization tidak ditemukan");
    }

    const payload = await verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
};

/** Require the authenticated user to hold one of the given roles. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(role)) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}
