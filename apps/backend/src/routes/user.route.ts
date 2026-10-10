import { Router } from "express";
import { userController } from "../controllers/user.controller";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from "../controllers/user.schema";
import { validate } from "../middleware/validate";
import { paginationSchema } from "../utils/pagination";

export const userRouter = Router();

userRouter.get(
  "/",
  validate({ query: paginationSchema }),
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
