import { create } from "zustand";
import type { AuthSession, AuthTokenResponse, AuthUser } from "../types";

/**
 * Browser key where the session is persisted. "Ingat saya" chooses between
 * localStorage (persist across restarts) and sessionStorage (per tab).
 */
export const SESSION_KEY = "dolenae.auth.session";

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  for (const storage of [window.sessionStorage, window.localStorage]) {
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) continue;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      storage.removeItem(SESSION_KEY);
    }
  }
  return null;
}

function writeSession(session: AuthSession, remember: boolean): void {
  if (typeof window === "undefined") return;
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  other.removeItem(SESSION_KEY);
  target.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

interface AuthStoreState {
  token: string | null;
  user: AuthUser | null;
  /** True once the store has read the persisted session (browser only). */
  hydrated: boolean;
  hydrate: () => void;
  setSession: (response: AuthTokenResponse, remember?: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: () => {
    const session = readSession();
    set({
      token: session?.token ?? null,
      user: session?.user ?? null,
      hydrated: true,
    });
  },

  setSession: (response, remember = true) => {
    writeSession({ token: response.token, user: response.user }, remember);
    set({ token: response.token, user: response.user });
  },

  clearSession: () => {
    clearStoredSession();
    set({ token: null, user: null });
  },
}));