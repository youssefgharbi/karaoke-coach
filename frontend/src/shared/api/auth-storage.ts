import type { AuthSession } from "../types/auth";

const AUTH_STORAGE_KEY = "karaoke-coach.auth-session";

function isAuthSession(value: unknown): value is AuthSession {
  return Boolean(
    value &&
      typeof value === "object" &&
      "userId" in value &&
      "displayName" in value &&
      "email" in value &&
      "accessToken" in value,
  );
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    return isAuthSession(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: AuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredAccessToken() {
  return readStoredSession()?.accessToken ?? null;
}
