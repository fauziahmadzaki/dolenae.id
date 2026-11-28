import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { bmkgService } from "../services/BmkgService";
import { destinationService } from "../services/DestinationService";
import type { DestinationIdParams } from "../types/destination";
import { NotFoundError } from "../utils/errors";
import { ok } from "../utils/response";

class WeatherController {
  /** GET /api/destinations/:id/weather — BMKG 3-day forecast & active alerts. */
  byDestination: RequestHandler = async (req, res, next) => {
    try {
      const params = getValidated<DestinationIdParams>(req, "params");
      const destination = await destinationService.getById(params.id);
      if (req.user?.role !== "admin" && destination.status !== "published") {
        throw new NotFoundError("Destinasi tidak ditemukan");
      }

      const weather = await bmkgService.getDestinationWeather({
        id: destination.id,
        name: destination.name,
        province: destination.location.province ?? "",
        district: destination.location.district ?? "",
        latitude: destination.location.latitude,
        longitude: destination.location.longitude,
      });
      ok(res, weather);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/weather/alerts — active BMKG alerts matched to published destinations. */
  alerts: RequestHandler = async (_req, res, next) => {
    try {
      const targets = await destinationService.listPublishedGeoTargets();
      const feed = await bmkgService.getAlertsFeed(targets);
      ok(res, feed);
    } catch (err) {
      next(err);
    }
  };
}

export const weatherController = new WeatherController();
