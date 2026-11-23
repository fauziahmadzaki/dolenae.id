import { get, patch, post } from "~/lib/api/client";
import type { AuthUser } from "../types";

export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
}

export async function getMe(token: string): Promise<AuthUser> {
  const { data } = await get<AuthUser>("/auth/me", { token });
  return data;
}

export async function updateMe(
  payload: UpdateProfilePayload,
  token: string,
): Promise<AuthUser> {
  const { data } = await patch<AuthUser>("/auth/me", payload, { token });
  return data;
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ message: string }> {
  const { data } = await post<{ message: string }>(
    "/auth/resend-verification",
    { email },
  );
  return data;
}
