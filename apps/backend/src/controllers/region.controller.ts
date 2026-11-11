import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { regionService } from "../services/region.service";
import { ok } from "../utils/response";
import type { DistrictQuery, RegencyQuery, ReverseQuery } from "../types/region";

class RegionController {
  /** GET /api/regions/provinces — all provinces (public). */
  provinces: RequestHandler = async (_req, res, next) => {
    try {
      ok(res, regionService.provinces());
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/regions/regencies?province= — regencies of a province (public). */
  regencies: RequestHandler = async (req, res, next) => {
    try {
      const { province } = getValidated<RegencyQuery>(req, "query");
      ok(res, regionService.regencies(province));
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/regions/districts?regency= — districts of a regency (public). */
  districts: RequestHandler = async (req, res, next) => {
    try {
      const { regency } = getValidated<DistrictQuery>(req, "query");
      ok(res, regionService.districts(regency));
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/regions/reverse?lat=&lng= — approximate reverse geocode (public). */
  reverse: RequestHandler = async (req, res, next) => {
    try {
      const { lat, lng } = getValidated<ReverseQuery>(req, "query");
      ok(res, regionService.reverse(lat, lng));
    } catch (err) {
      next(err);
    }
  };
}

export const regionController = new RegionController();
