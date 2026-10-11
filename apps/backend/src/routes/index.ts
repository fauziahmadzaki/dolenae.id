import { Router } from "express";
import { authRouter } from "./auth.route";
import { healthRouter } from "./health.route";

/** Main API router, mounted at `/api`. Add domain routes here. */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
