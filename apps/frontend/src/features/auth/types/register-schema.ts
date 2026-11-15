import { z } from "zod";

/**
 * Web registration creates a **merchant** account (role is forced by the
 * server action). Rules align with `apps/backend/src/schemas/auth.schema.ts`.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter")
      .max(120, "Nama maksimal 120 karakter"),
    email: z.string().trim().email("Email tidak valid").max(255),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(128, "Kata sandi maksimal 128 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
