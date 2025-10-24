"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/lib/auth";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const verifySession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.user) {
          setUser(data.user);
          return true;
        }
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshed = await authService.refreshAccessToken();
    if (refreshed) {
      await verifySession();
    } else {
      setUser(null);
    }
  }, [verifySession]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes
    const interval = setInterval(() => {
      refreshSession();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user, refreshSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await authService.login(identifier, password);
    authService.setRefreshToken(response.refreshToken);
    await verifySession();
  }, [verifySession]);

  const logout = useCallback(async () => {
    await authService.logout();
    authService.clearRefreshToken();
    setUser(null);
    router.push("/auth");
  }, [router]);

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        isAuthenticated: !!user,
        login, 
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
