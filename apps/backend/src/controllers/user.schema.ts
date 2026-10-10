import { z } from "zod";

/** Skema validasi pembuatan user baru. */
export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid").max(255),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(128),
  role: z.enum(["wisatawan", "merchant", "admin"]).default("wisatawan"),
});

/** Skema validasi pembaruan user (minimal 1 field diubah). */
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120).optional(),
    email: z.string().trim().email("Format email tidak valid").max(255).optional(),
    password: z.string().min(8, "Kata sandi minimal 8 karakter").max(128).optional(),
    role: z.enum(["wisatawan", "merchant", "admin"]).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi untuk update",
  );

/** Skema validasi parameter ID user UUID. */
export const userIdParamsSchema = z.object({
  id: z.string().uuid("ID user harus berupa format UUID yang valid"),
});

export type CreateUserSchema = typeof createUserSchema;
export type UpdateUserSchema = typeof updateUserSchema;
export type UserIdParamsSchema = typeof userIdParamsSchema;
