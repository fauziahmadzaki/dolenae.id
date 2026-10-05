import type { Context } from "hono";
import { userService } from "../services/user.service";
import { parsePagination } from "../utils/pagination";
import { ok } from "../utils/response";
import { UnauthorizedError } from "../utils/errors";
import type { AppEnv } from "../types/auth";

export const userController = {
  /** GET /api/users/me — user dari token. */
  async me(c: Context<AppEnv>) {
    const authUser = c.get("user");
    if (!authUser) throw new UnauthorizedError();
    const user = await userService.getById(authUser.id);
    return ok(c, user);
  },

  /** GET /api/users — daftar user dengan pagination. */
  async list(c: Context<AppEnv>) {
    const params = parsePagination(c);
    const result = await userService.list(params);
    return ok(c, result.items, { pagination: result.pagination });
  },
};
