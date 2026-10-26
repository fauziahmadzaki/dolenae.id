import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { categoryService, type CreateCategoryDto, type UpdateCategoryDto } from "../services/category.service";
import type { CategoryListQuery } from "./category.schema";
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
      const params = getValidated<{ id: string }>(req, "params");
      const category = await categoryService.getById(params.id);
      return ok(res, category);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** POST /api/categories — admin membuat kategori. */
  create: (async (req, res, next) => {
    try {
      const body = getValidated<CreateCategoryDto>(req, "body");
      const category = await categoryService.create(body);
      return ok(res, category, undefined, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** PATCH /api/categories/:id — admin memperbarui kategori. */
  update: (async (req, res, next) => {
    try {
      const params = getValidated<{ id: string }>(req, "params");
      const body = getValidated<UpdateCategoryDto>(req, "body");
      const category = await categoryService.update(params.id, body);
      return ok(res, category);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** DELETE /api/categories/:id — admin menghapus kategori. */
  delete: (async (req, res, next) => {
    try {
      const params = getValidated<{ id: string }>(req, "params");
      const result = await categoryService.delete(params.id);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
