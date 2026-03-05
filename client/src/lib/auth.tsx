import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { apiRequest, queryClient, setAuthToken, getAuthToken } from "./queryClient";

type AuthUser = {
  id: string;
  username: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
  locale: string | null;
  preferredCurrency: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string; companyName: string; firstName: string; lastName: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    fetch("/api/auth/me", { credentials: "include", headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { username, password });
    const data = await res.json();
    const { token, ...userData } = data;
    if (token) setAuthToken(token);
    queryClient.clear();
    setUser(userData);
  }, []);

  const register = useCallback(async (data: { username: string; password: string; companyName: string; firstName: string; lastName: string; email: string }) => {
    const res = await apiRequest("POST", "/api/auth/register", data);
    const responseData = await res.json();
    const { token, ...userData } = responseData;
    if (token) setAuthToken(token);
    queryClient.clear();
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("POST", "/api/auth/logout");
    setAuthToken(null);
    queryClient.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
