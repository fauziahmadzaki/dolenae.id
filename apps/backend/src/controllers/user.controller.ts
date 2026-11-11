import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { userService } from "../services/user.service";
import type {
  CreateUserBody,
  UpdateUserBody,
  UserIdParams,
  UserListQuery,
} from "../types/user";
import { ok } from "../utils/response";

export const userController = {
  /** GET /api/users — daftar pengguna dengan pagination & pencarian. */
  list: (async (req, res, next) => {
    try {
      const query = getValidated<UserListQuery>(req, "query");
      const result = await userService.list(query);
      return ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** GET /api/users/:id — detail pengguna berdasarkan ID. */
  getById: (async (req, res, next) => {
    try {
      const params = getValidated<UserIdParams>(req, "params");
      const user = await userService.getById(params.id);
      return ok(res, user);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** POST /api/users — admin membuat pengguna baru. */
  create: (async (req, res, next) => {
    try {
      const body = getValidated<CreateUserBody>(req, "body");
      const user = await userService.create(body);
      return ok(res, user, undefined, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** PATCH /api/users/:id — admin memperbarui pengguna. */
  update: (async (req, res, next) => {
    try {
      const params = getValidated<UserIdParams>(req, "params");
      const body = getValidated<UpdateUserBody>(req, "body");
      const user = await userService.update(params.id, body);
      return ok(res, user);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** DELETE /api/users/:id — admin menghapus pengguna. */
  delete: (async (req, res, next) => {
    try {
      const params = getValidated<UserIdParams>(req, "params");
      const currentUserId = req.user?.id;
      const result = await userService.delete(params.id, currentUserId);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
