"use client";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  displayName: string;
  email: string;
  roles: string[];
  permissions: string[];
  lastActivityAt: number;
};

const sessionKey = "erp.session";
const inactivityLimitMs = 5 * 60 * 1000;

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(sessionKey);
  if (!raw) {
    return null;
  }

  const session = JSON.parse(raw) as AuthSession;
  if (Date.now() - session.lastActivityAt > inactivityLimitMs) {
    clearSession();
    return null;
  }

  return session;
}

export function saveSession(session: Omit<AuthSession, "lastActivityAt"> | AuthSession) {
  window.sessionStorage.setItem(
    sessionKey,
    JSON.stringify({
      ...session,
      lastActivityAt: Date.now(),
    }),
  );
}

export function touchSession() {
  const session = getSession();
  if (session) {
    saveSession(session);
  }
}

export function clearSession() {
  window.sessionStorage.removeItem(sessionKey);
}

export function hasPermission(session: AuthSession | null, permission: string) {
  return Boolean(
    session?.permissions.includes(permission) ||
      session?.roles.includes("Admin") ||
      session?.roles.includes("SuperAdmin"),
  );
}

async function refreshSession(session: AuthSession): Promise<AuthSession> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:5250"}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    throw new Error("Session expired.");
  }

  const refreshed = (await response.json()) as Omit<AuthSession, "lastActivityAt">;
  saveSession(refreshed);
  return getSession() as AuthSession;
}

export async function logout() {
  const session = getSession();
  if (session) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:5250"}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    }).catch(() => undefined);
  }
  clearSession();
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let session = getSession();
  if (!session) {
    throw new Error("Session expired.");
  }

  let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:5250"}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...init.headers,
    },
  });

  if (response.status === 401) {
    session = await refreshSession(session);
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:5250"}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
        ...init.headers,
      },
    });
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  touchSession();
  return response.json() as Promise<T>;
}
