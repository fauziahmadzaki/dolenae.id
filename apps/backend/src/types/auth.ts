/** Domain types for authentication (kept in sync with the web/mobile clients). */

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

/** Access-token claims. `sub` is the user id. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Payload returned by register/login/google. */
export interface AuthTokenResponse {
  token: string;
  user: AuthUser;
}

/** Authenticated principal attached to `req.user` by the auth middleware. */
export interface AuthPrincipal {
  id: string;
  email: string;
  role: UserRole;
}
