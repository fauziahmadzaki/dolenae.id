import type { z } from "zod";
import type { NewUserRow, UserRole } from "../db/models";
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

/** Fields a caller may update after the user exists. */
export type UserPatch = Partial<
  Pick<
    NewUserRow,
    | "email"
    | "name"
    | "passwordHash"
    | "role"
    | "provider"
    | "googleId"
    | "avatarUrl"
    | "emailVerifiedAt"
    | "lastLoginAt"
  >
>;

/** Alias kept for the user-management service. */
export type UpdateUserInput = UserPatch;

/** Bentuk data user yang aman dikirim ke klien (tanpa passwordHash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Null until the email is confirmed (drives the derived status). */
  emailVerifiedAt: string | null;
  /** Null when the account never signed in. */
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
