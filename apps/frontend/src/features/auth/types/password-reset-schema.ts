import { z } from "zod";

/**
 * Validation schemas for the password-reset flow.
 * Rules align with `apps/backend/src/controllers/auth.schema.ts`:
 * email must be valid, password is 8–128 characters.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(128, "Kata sandi maksimal 128 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
