"use server";

import { post } from "~/lib/api/server";
import { ApiError } from "~/lib/api/types";

export type VerifyEmailActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/**
 * Server action for `POST /api/auth/verify-email`.
 * The endpoint is idempotent, so a refresh (or React's double effect) is safe.
 */
export async function verifyEmailAction(
  token: string,
): Promise<VerifyEmailActionResult> {
  if (!token) {
    return {
      ok: false,
      message: "Tautan verifikasi tidak lengkap. Buka tautan dari email kamu.",
    };
  }

  try {
    const { data } = await post<{ message: string }>("/auth/verify-email", {
      token,
    });
    return { ok: true, message: data.message };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
