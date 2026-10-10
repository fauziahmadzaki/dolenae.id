import { Router } from "express";
import { userController } from "../controllers/user.controller";
import {
  userListQuerySchema,
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from "../controllers/user.schema";
import { validate } from "../middleware/validate";

import { authRequired, requireRole } from "../middleware/auth";

export const userRouter = Router();
userRouter.use(authRequired, requireRole("admin"));

userRouter.get(
  "/",
  validate({ query: userListQuerySchema }),
  userController.list,
);

userRouter.post(
  "/",
  validate({ body: createUserSchema }),
  userController.create,
);

userRouter.get(
  "/:id",
  validate({ params: userIdParamsSchema }),
  userController.getById,
);

userRouter.patch(
  "/:id",
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  userController.update,
);

userRouter.delete(
  "/:id",
  validate({ params: userIdParamsSchema }),
  userController.delete,
);
