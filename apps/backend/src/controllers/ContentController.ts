import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { contentService } from "../services/ContentService";
import type {
  ContentIdParams,
  ContentListQuery,
  ContentSlugParams,
  CreateContentBody,
  PublicContentListQuery,
  UpdateContentBody,
} from "../types/content";
import { ok } from "../utils/response";

class ContentController {
  /** GET /api/admin/contents — admin table with filters and pagination. */
  listAdmin: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<ContentListQuery>(req, "query");
      const result = await contentService.listAdmin(query);
      ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/admin/contents/:id — full article for the edit dialog. */
  getById: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<ContentIdParams>(req, "params");
      ok(res, await contentService.getById(params.id));
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/admin/contents — create an article as the signed-in admin. */
  create: RequestHandler = async (req, res, next) => {
    try {
      const body = getValidated<CreateContentBody>(req, "body");
      const content = await contentService.create(body, req.user?.id ?? null);
      ok(res, content, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/admin/contents/:id — update fields or publish state. */
  update: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<ContentIdParams>(req, "params");
      const body = getValidated<UpdateContentBody>(req, "body");
      ok(res, await contentService.update(params.id, body));
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/admin/contents/:id — remove an article. */
  delete: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<ContentIdParams>(req, "params");
      ok(res, await contentService.delete(params.id));
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/contents — public list of published articles. */
  listPublic: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<PublicContentListQuery>(req, "query");
      const result = await contentService.listPublic(query);
      ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/contents/:slug — public article detail, bumps the view count. */
  getPublicBySlug: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<ContentSlugParams>(req, "params");
      ok(res, await contentService.getPublicBySlug(params.slug));
    } catch (err) {
      next(err);
    }
  };
}

export const contentController = new ContentController();
