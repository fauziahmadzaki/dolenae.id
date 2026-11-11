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

class UserController {
  /** GET /api/users — daftar pengguna dengan pagination & pencarian. */
  list: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<UserListQuery>(req, "query");
      const result = await userService.list(query);
      ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/users/:id — detail pengguna berdasarkan ID. */
  getById: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<UserIdParams>(req, "params");
      const user = await userService.getById(params.id);
      ok(res, user);
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/users — admin membuat pengguna baru. */
  create: RequestHandler = async (req, res, next) => {
    try {
      const body = getValidated<CreateUserBody>(req, "body");
      const user = await userService.create(body);
      ok(res, user, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/users/:id — admin memperbarui pengguna. */
  update: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<UserIdParams>(req, "params");
      const body = getValidated<UpdateUserBody>(req, "body");
      const user = await userService.update(params.id, body);
      ok(res, user);
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/users/:id — admin menghapus pengguna. */
  delete: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<UserIdParams>(req, "params");
      const currentUserId = req.user?.id;
      const result = await userService.delete(params.id, currentUserId);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const userController = new UserController();
