import { get, patch, post } from "~/lib/api/client";
import type { AuthUser } from "../types";

export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
}

type MePayload = AuthUser | { user: AuthUser };

function unwrapUser(data: MePayload): AuthUser {
  return "user" in data ? data.user : data;
}

export async function getMe(token: string): Promise<AuthUser> {
  const { data } = await get<MePayload>("/auth/me", { token });
  return unwrapUser(data);
}

export async function updateMe(
  payload: UpdateProfilePayload,
  token: string,
): Promise<AuthUser> {
  const { data } = await patch<MePayload>("/auth/me", payload, { token });
  return unwrapUser(data);
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
