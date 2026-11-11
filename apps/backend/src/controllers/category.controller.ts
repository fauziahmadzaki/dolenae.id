import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { categoryService } from "../services/category.service";
import type {
  CategoryIdParams,
  CategoryListQuery,
  CreateCategoryBody,
  UpdateCategoryBody,
} from "../types/category";
import { ok } from "../utils/response";

export const categoryController = {
  /** GET /api/categories — daftar kategori (publik) dengan pagination & pencarian. */
  list: (async (req, res, next) => {
    try {
      const query = getValidated<CategoryListQuery>(req, "query");
      const result = await categoryService.list(query);
      return ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** GET /api/categories/:id — detail kategori (publik). */
  getById: (async (req, res, next) => {
    try {
      const params = getValidated<CategoryIdParams>(req, "params");
      const category = await categoryService.getById(params.id);
      return ok(res, category);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** POST /api/categories — admin membuat kategori. */
  create: (async (req, res, next) => {
    try {
      const body = getValidated<CreateCategoryBody>(req, "body");
      const category = await categoryService.create(body);
      return ok(res, category, undefined, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** PATCH /api/categories/:id — admin memperbarui kategori. */
  update: (async (req, res, next) => {
    try {
      const params = getValidated<CategoryIdParams>(req, "params");
      const body = getValidated<UpdateCategoryBody>(req, "body");
      const category = await categoryService.update(params.id, body);
      return ok(res, category);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** DELETE /api/categories/:id — admin menghapus kategori. */
  delete: (async (req, res, next) => {
    try {
      const params = getValidated<CategoryIdParams>(req, "params");
      const result = await categoryService.delete(params.id);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
