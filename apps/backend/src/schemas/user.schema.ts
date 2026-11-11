import { z } from "zod";
import { paginationSchema } from "../utils/pagination";
import { USER_ROLES, USER_STATUS_FILTERS } from "../types/auth";
export const userListQuerySchema = paginationSchema.extend({
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUS_FILTERS).optional(),
});

/** Skema validasi pembuatan user baru. */
export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid").max(255),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(128),
  role: z.enum(USER_ROLES).default(USER_ROLES[0]),
});

/** Skema validasi pembaruan user (minimal 1 field diubah). */
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120).optional(),
    email: z.string().trim().email("Format email tidak valid").max(255).optional(),
    password: z.string().min(8, "Kata sandi minimal 8 karakter").max(128).optional(),
    role: z.enum(USER_ROLES).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi untuk update",
  );

/** Skema validasi parameter ID user UUID. */
export const userIdParamsSchema = z.object({
  id: z.string().uuid("ID user harus berupa format UUID yang valid"),
});

