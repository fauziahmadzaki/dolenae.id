import type { ApiUser } from "~/lib/api";

const TOKEN_KEY = "dolenae.admin.token";
const USER_KEY = "dolenae.admin.user";

/** Simpan sesi admin di localStorage (fase prototype; belum auth server-side SSR). */
export function saveSession(token: string, user: ApiUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

/** True bila token ada dan belum kedaluwarsa (dibaca dari payload JWT). */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 > Date.now();
}

export function decodeJwt(token: string): { exp?: number; sub?: string } | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as { exp?: number; sub?: string };
  } catch {
    return null;
  }
}
