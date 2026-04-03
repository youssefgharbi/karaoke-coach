import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { apiRequest } from "../../shared/api/client";
import { readStoredSession, writeStoredSession } from "../../shared/api/auth-storage";
import type { AuthResponse, AuthSession } from "../../shared/types/auth";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  authenticate: (response: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(readStoredSession()));

  useEffect(() => {
    let isMounted = true;
    const initialSession = readStoredSession();

    if (!initialSession) {
      setIsBootstrapping(false);
      return undefined;
    }

    apiRequest<AuthResponse>("/auth/me")
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setSession(response);
        writeStoredSession(response);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSession(null);
        writeStoredSession(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isBootstrapping,
      authenticate: (response) => {
        setSession(response);
        writeStoredSession(response);
      },
      logout: () => {
        setSession(null);
        writeStoredSession(null);
      },
    }),
    [isBootstrapping, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
