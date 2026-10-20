/** Domain types for authentication (kept in sync with the web/mobile clients). */

export const USER_ROLES = ["wisatawan", "merchant", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const AUTH_PROVIDERS = ["local", "google"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/** Derived account status for the admin user table (no extra column needed). */
export const USER_STATUS_FILTERS = ["active", "unverified", "inactive"] as const;
export type UserStatusFilter = (typeof USER_STATUS_FILTERS)[number];

/** A verified account with no login for this long counts as inactive. */
export const INACTIVE_AFTER_DAYS = 90;

/** Public user shape returned by the API (never includes the password hash). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  avatarUrl: string | null;
  /** ISO timestamp once the email is confirmed (null while unverified). */
  emailVerifiedAt: string | null;
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
