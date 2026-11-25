import { z } from "zod";
import { USER_ROLES } from "../types/auth";

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(128, "Password maksimal 128 karakter");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Email tidak valid").max(255),
  password: passwordSchema,
  // Public registration can create a `wisatawan` or `merchant` (never admin).
  role: z.enum([USER_ROLES[0], USER_ROLES[1]]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const googleSchema = z.object({
  idToken: z.string().min(1, "idToken wajib diisi"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
});


export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120).optional(),
    phone: z.string().trim().max(30).nullable().optional(),
    city: z.string().trim().max(80).nullable().optional(),
    bio: z.string().trim().max(1000).nullable().optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "Setidaknya satu field harus diisi",
  );
