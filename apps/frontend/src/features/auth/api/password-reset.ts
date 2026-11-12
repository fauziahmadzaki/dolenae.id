"use server";

import { post } from "~/lib/api/server";
import { ApiError } from "~/lib/api/types";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "../types/password-reset-schema";

export type PasswordResetActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export interface ResetPasswordPayload extends ResetPasswordInput {
  token: string;
}

function collectFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const name = String(issue.path[0] ?? "root");
    if (!fieldErrors[name]) fieldErrors[name] = issue.message;
  }
  return fieldErrors;
}

/**
 * Server action for `POST /api/auth/forgot-password`.
 * The endpoint always answers with a generic message (anti-enumeration).
 */
export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<PasswordResetActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali isian Anda.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  try {
    const { data } = await post<{ message: string }>("/auth/forgot-password", {
      email: parsed.data.email,
    });
    return { ok: true, message: data.message };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan. Silakan coba lagi." };
  }
}

/** Server action for `POST /api/auth/reset-password` (token from the email link). */
export async function resetPasswordAction(
  input: ResetPasswordPayload,
): Promise<PasswordResetActionResult> {
  if (!input.token) {
    return {
      ok: false,
      message: "Tautan reset tidak valid. Minta tautan baru terlebih dahulu.",
    };
  }

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali isian Anda.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  try {
    const { data } = await post<{ message: string }>("/auth/reset-password", {
      token: input.token,
      password: parsed.data.password,
    });
    return { ok: true, message: data.message };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
