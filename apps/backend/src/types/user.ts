import type { z } from "zod";
import type {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  userListQuerySchema,
} from "../schemas/user.schema";

export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
