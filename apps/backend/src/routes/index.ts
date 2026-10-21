import { Router } from "express";
import { authRouter } from "./auth.route";
import { categoryRouter } from "./category.route";
import { destinationRouter } from "./destination.route";
import { healthRouter } from "./health.route";
import { regionRouter } from "./region.route";
import { routeBuilderRouter } from "./route.route";
import { uploadRouter } from "./upload.route";
import { userRouter } from "./user.route";

/** Main API router, mounted at `/api`. Add domain routes here. */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/destinations", destinationRouter);
apiRouter.use("/regions", regionRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/", routeBuilderRouter);
