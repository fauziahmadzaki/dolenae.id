"use server";

import { post } from "~/lib/api/server";
import { ApiError } from "~/lib/api/types";
import { loginSchema, type LoginInput } from "../types/login-schema";
import type { AuthTokenResponse } from "../types";

export type LoginActionResult =
  | { ok: true; data: AuthTokenResponse }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/**
 * Server action (SCRUM-8) that calls `POST /api/auth/login` from the server.
 * Never throws: it normalises backend `ApiError` into a plain result.
 */
export async function loginAction(input: LoginInput): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);
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
    const { data } = await post<AuthTokenResponse>("/auth/login", {
      email: parsed.data.email,
      password: parsed.data.password,
    });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan. Silakan coba lagi." };
  }
}