import { Router } from "express";
import { weatherController } from "../controllers/WeatherController";
import { authOptional } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { destinationIdParamsSchema } from "../schemas/destination.schema";

export const weatherRouter = Router();

weatherRouter.get(
  "/destinations/:id/weather",
  authOptional,
  validate({ params: destinationIdParamsSchema }),
  weatherController.byDestination,
);

weatherRouter.get("/weather/alerts", authOptional, weatherController.alerts);
