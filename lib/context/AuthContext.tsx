"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthUser, AuthResponse, RegisterRequest } from "@/lib/api/types";
import { setTokens, clearTokens, getTokens } from "@/lib/api/client";
import { login as apiLogin, register as apiRegister, getMe } from "@/lib/api/resources";
import { withBackendFallback, isBackendConfigured } from "@/lib/api/fallback";
import { MOCK_CUSTOMER } from "@/lib/mock/user";

// ============================================================================
// Demo-mode auth (no backend configured / unreachable)
// ============================================================================

const DEMO_USER_STORAGE_KEY = "souqi_demo_user_v1";
const DEMO_TOKEN_PREFIX = "souqi_demo_";

function isDemoToken(token?: string | null): boolean {
  return typeof token === "string" && token.startsWith(DEMO_TOKEN_PREFIX);
}

function saveDemoUser(user: AuthUser): void {
  try {
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // no-op on localStorage restriction
  }
}

function loadDemoUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function createDemoAuthResponse(user: AuthUser): AuthResponse {
  const stamp = Date.now();
  return {
    user,
    access: `${DEMO_TOKEN_PREFIX}access_${stamp}`,
    refresh: `${DEMO_TOKEN_PREFIX}refresh_${stamp}`,
  };
}


export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
}

export type ExtendedAuthContextValue = AuthContextValue;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate session on mount from backend if access token is found
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const tokens = getTokens();
      if (!tokens?.access) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Demo-mode session: restore the locally stored demo user, no network call.
      if (isDemoToken(tokens.access)) {
        const demoUser = loadDemoUser();
        if (!demoUser) {
          clearTokens();
        }
        if (isMounted) {
          setUser(demoUser);
          setIsLoading(false);
        }
        return;
      }

      // A real JWT exists but no backend is configured (demo deploy) → drop it.
      if (!isBackendConfigured()) {
        clearTokens();
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await getMe();
        if (isMounted) {
          setUser(me);
        }
      } catch {
        clearTokens();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const normalizedEmail = email.trim().toLowerCase();
        // Real backend when configured/reachable; otherwise instant demo session.
        const res = await withBackendFallback(
          () => apiLogin({ email: normalizedEmail, password }),
          (): AuthResponse =>
            createDemoAuthResponse({
              id: 1,
              name: MOCK_CUSTOMER.name,
              email: normalizedEmail,
              role: "customer",
            })
        );
        setTokens({ access: res.access, refresh: res.refresh });
        if (isDemoToken(res.access)) {
          saveDemoUser(res.user);
        }
        setUser(res.user);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const normalizedEmail = data.email.trim().toLowerCase();
        const res = await withBackendFallback(
          () =>
            apiRegister({
              name: data.name.trim(),
              email: normalizedEmail,
              password: data.password,
              role: data.role,
            }),
          (): AuthResponse =>
            createDemoAuthResponse({
              id: 1,
              name: data.name.trim(),
              email: normalizedEmail,
              role: data.role,
            })
        );
        setTokens({ access: res.access, refresh: res.refresh });
        if (isDemoToken(res.access)) {
          saveDemoUser(res.user);
        }
        setUser(res.user);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
