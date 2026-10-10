import { z } from "zod";

/**
 * Validation schema for the login form.
 * Rules align with `apps/backend/src/controllers/auth.schema.ts` (login):
 * email must be a valid e-mail, password is required (min 1).
 */
export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
  /** Persist the session across browser restarts ("Ingat saya"). */
  remember: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;