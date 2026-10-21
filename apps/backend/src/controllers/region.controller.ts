import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { regionService } from "../services/region.service";
import { ok } from "../utils/response";
import type { DistrictQuery, RegencyQuery, ReverseQuery } from "./region.schema";

export const regionController = {
  /** GET /api/regions/provinces — all provinces (public). */
  provinces: (async (_req, res, next) => {
    try {
      return ok(res, regionService.provinces());
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** GET /api/regions/regencies?province= — regencies of a province (public). */
  regencies: (async (req, res, next) => {
    try {
      const { province } = getValidated<RegencyQuery>(req, "query");
      return ok(res, regionService.regencies(province));
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** GET /api/regions/districts?regency= — districts of a regency (public). */
  districts: (async (req, res, next) => {
    try {
      const { regency } = getValidated<DistrictQuery>(req, "query");
      return ok(res, regionService.districts(regency));
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  /** GET /api/regions/reverse?lat=&lng= — approximate reverse geocode (public). */
  reverse: (async (req, res, next) => {
    try {
      const { lat, lng } = getValidated<ReverseQuery>(req, "query");
      return ok(res, regionService.reverse(lat, lng));
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
