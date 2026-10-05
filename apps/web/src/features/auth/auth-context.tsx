import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ApiUser } from "~/lib/api";
import { getMe, login as loginApi } from "./api";
import {
  clearSession,
  getStoredUser,
  getToken,
  isTokenValid,
  saveSession,
} from "./session";

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  // Pulihkan sesi dari localStorage saat mount.
  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken || !isTokenValid(storedToken)) {
      clearSession();
      setReady(true);
      return;
    }
    setToken(storedToken);
    setUser(getStoredUser());

    // Validasi token ke server (memastikan belum dicabut/berubah).
    getMe(storedToken)
      .then((res) => {
        setUser(res.data);
        saveSession(storedToken, res.data);
      })
      .catch(() => {
        clearSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginApi({ email, password });
      saveSession(res.data.token, res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    void navigate({ to: "/login" });
  }, [navigate]);

  const value = useMemo<AuthState>(
    () => ({ user, token, ready, login, logout }),
    [user, token, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
