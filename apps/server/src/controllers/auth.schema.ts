import { z } from "zod";

/** Skema input register. */
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid").max(255),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(128),
  role: z.enum(["wisatawan", "merchant", "admin"]).optional(),
});

/** Skema input login. */
export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export type RegisterSchema = typeof registerSchema;
export type LoginSchema = typeof loginSchema;
