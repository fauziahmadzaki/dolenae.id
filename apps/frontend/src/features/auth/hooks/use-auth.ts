"use client";

import { useEffect } from "react";
import { useAuthStore } from "./auth-store";
import type { AuthTokenResponse, AuthUser } from "../types";

export interface UseAuth {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (response: AuthTokenResponse, remember?: boolean) => void;
  logout: () => void;
}

/**
 * Auth session hook — single source of truth for the signed-in user.
 * Backed by a tiny zustand store hydrated from localStorage/sessionStorage.
 */
export function useAuth(): UseAuth {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    if (!useAuthStore.getState().hydrated) hydrate();
  }, [hydrate]);

  return {
    token,
    user,
    isAuthenticated: hydrated && token !== null,
    hydrated,
    login: setSession,
    logout: clearSession,
  };
}