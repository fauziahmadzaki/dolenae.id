"use server";

import { post } from "~/lib/api/server";
import { ApiError } from "~/lib/api/types";
import { registerSchema, type RegisterInput } from "../types/register-schema";
import type { AuthTokenResponse } from "../types";

export type RegisterActionResult =
  | { ok: true; data: AuthTokenResponse }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/**
 * Server action for web registration. The web always registers a **merchant**
 * account; the backend rejects `admin` and defaults other roles to wisatawan.
 */
export async function registerAction(
  input: RegisterInput,
): Promise<RegisterActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path.length > 0 && !fieldErrors[String(issue.path[0])]) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
    }
    return { ok: false, message: "Periksa kembali isian Anda.", fieldErrors };
  }

  try {
    const { data } = await post<AuthTokenResponse>("/auth/register", {
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: "merchant",
    });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409 || error.code === "CONFLICT") {
        return {
          ok: false,
          message: error.message,
          fieldErrors: { email: "Email sudah terdaftar" },
        };
      }
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
