import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { destinationService } from "../services/destination.service";
import type {
  CreateDestinationBody,
  DestinationIdParams,
  DestinationListQuery,
  UpdateDestinationBody,
} from "../types/destination";
import { ok } from "../utils/response";
import { NotFoundError } from "../utils/errors";

class DestinationController {
  /** GET /api/destinations — daftar destinasi (publik) dengan pagination & filter. */
  list: RequestHandler = async (req, res, next) => {
    try {
      const query = getValidated<DestinationListQuery>(req, "query");
      const result = await destinationService.list({
        ...query,
        status: req.user?.role === "admin" ? query.status : "published",
      });
      ok(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/destinations/:id — detail destinasi beserta kategori (publik). */
  getById: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<DestinationIdParams>(req, "params");
      const destination = await destinationService.getById(params.id);
      if (req.user?.role !== "admin" && destination.status !== "published") {
        throw new NotFoundError("Destinasi tidak ditemukan");
      }
      ok(res, destination);
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/destinations — admin membuat destinasi. */
  create: RequestHandler = async (req, res, next) => {
    try {
      const body = getValidated<CreateDestinationBody>(req, "body");
      const destination = await destinationService.create(body);
      ok(res, destination, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/destinations/:id — admin memperbarui destinasi. */
  update: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<DestinationIdParams>(req, "params");
      const body = getValidated<UpdateDestinationBody>(req, "body");
      const destination = await destinationService.update(params.id, body);
      ok(res, destination);
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/destinations/:id — admin menghapus destinasi. */
  delete: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<DestinationIdParams>(req, "params");
      const result = await destinationService.delete(params.id);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const destinationController = new DestinationController();
