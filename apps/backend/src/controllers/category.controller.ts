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

class CategoryController {
  /** GET /api/categories — daftar kategori (publik) dengan pagination & pencarian. */
  list: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<CategoryListQuery>(req, "query");
      const result = await categoryService.list(query);
      ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/categories/:id — detail kategori (publik). */
  getById: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<CategoryIdParams>(req, "params");
      const category = await categoryService.getById(params.id);
      ok(res, category);
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/categories — admin membuat kategori. */
  create: RequestHandler = async (req, res, next) => {
    try {
      const body = getValidated<CreateCategoryBody>(req, "body");
      const category = await categoryService.create(body);
      ok(res, category, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/categories/:id — admin memperbarui kategori. */
  update: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<CategoryIdParams>(req, "params");
      const body = getValidated<UpdateCategoryBody>(req, "body");
      const category = await categoryService.update(params.id, body);
      ok(res, category);
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/categories/:id — admin menghapus kategori. */
  delete: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<CategoryIdParams>(req, "params");
      const result = await categoryService.delete(params.id);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const categoryController = new CategoryController();
