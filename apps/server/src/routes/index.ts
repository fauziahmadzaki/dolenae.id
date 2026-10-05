import { Hono } from "hono";
import { healthRoute } from "./health.route";
import { authRoute } from "./auth.route";
import { userRoute } from "./user.route";
import { categoryRoute, destinationRoute, supportRoute } from "./catalog.route";
import { regionRoute } from "./region.route";
import { uploadRoute } from "./upload.route";
import type { AppEnv } from "../types/auth";

/**
 * Router utama aplikasi — semua endpoint di bawah prefix `/api`.
 */
export const apiRouter = new Hono<AppEnv>();

apiRouter.route("/health", healthRoute);
apiRouter.route("/auth", authRoute);
apiRouter.route("/users", userRoute);
apiRouter.route("/categories", categoryRoute);
apiRouter.route("/destinations", destinationRoute);
apiRouter.route("/supports", supportRoute);
apiRouter.route("/regions", regionRoute);
apiRouter.route("/uploads", uploadRoute);
