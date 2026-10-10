/**
 * Domain types for the auth feature (slicing SCRUM-8).
 * Mirrored by hand from `apps/backend/src/types/auth.ts` — keep in sync.
 */

export const USER_ROLES = ["wisatawan", "merchant", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const AUTH_PROVIDERS = ["local", "google"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/** Public user shape returned by the API (never includes the password hash). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload returned by POST /api/auth/login. */
export interface AuthTokenResponse {
  token: string;
  user: AuthUser;
}

/** Client-side session persisted to browser storage. */
export interface AuthSession {
  token: string;
  user: AuthUser;
}