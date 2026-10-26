import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import {
  destinationService,
  type CreateDestinationDto,
  type UpdateDestinationDto,
} from "../services/destination.service";
import type { DestinationListQuery } from "./destination.schema";
import { ok } from "../utils/response";

export const destinationController = {
  /** GET /api/destinations — daftar destinasi (publik) dengan pagination & filter. */
  list: (async (req, res, next) => {
    try {
      const query = getValidated<DestinationListQuery>(req, "query");
      const result = await destinationService.list(query);
      return ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** GET /api/destinations/:id — detail destinasi beserta kategori (publik). */
  getById: (async (req, res, next) => {
    try {
      const params = getValidated<{ id: string }>(req, "params");
      const destination = await destinationService.getById(params.id);
      return ok(res, destination);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** POST /api/destinations — admin membuat destinasi. */
  create: (async (req, res, next) => {
    try {
      const body = getValidated<CreateDestinationDto>(req, "body");
      const destination = await destinationService.create(body);
      return ok(res, destination, undefined, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** PATCH /api/destinations/:id — admin memperbarui destinasi. */
  update: (async (req, res, next) => {
    try {
      const params = getValidated<{ id: string }>(req, "params");
      const body = getValidated<UpdateDestinationDto>(req, "body");
      const destination = await destinationService.update(params.id, body);
      return ok(res, destination);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** DELETE /api/destinations/:id — admin menghapus destinasi. */
  delete: (async (req, res, next) => {
    try {
      const params = getValidated<{ id: string }>(req, "params");
      const result = await destinationService.delete(params.id);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
