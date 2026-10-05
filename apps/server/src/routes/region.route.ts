import { Hono } from "hono";
import { regionController } from "../controllers/region.controller";
import type { AppEnv } from "../types/auth";

/** Endpoint data wilayah (provinsi → kabupaten → kecamatan) + reverse geocode. */
export const regionRoute = new Hono<AppEnv>();

regionRoute.get("/provinces", regionController.provinces);
regionRoute.get("/regencies", regionController.regencies);
regionRoute.get("/districts", regionController.districts);
regionRoute.get("/reverse", regionController.reverse);
