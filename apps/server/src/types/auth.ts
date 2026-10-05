import type { UserRole } from "@dolenae/types";

/** Payload JWT yang kita terbitkan. */
export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/** User ringkas yang ditempelkan ke context Hono setelah auth berhasil. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/** Variabel context Hono yang kita set di middleware. */
export interface AppEnv {
  Variables: {
    requestId: string;
    user?: AuthUser;
  };
}
