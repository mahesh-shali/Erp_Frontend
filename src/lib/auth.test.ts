import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSession, getSession, hasPermission, saveSession } from "./auth";

describe("auth session", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.sessionStorage.clear();
  });

  it("stores tokens in sessionStorage and reads them back", () => {
    saveSession({
      accessToken: "access",
      refreshToken: "refresh",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      displayName: "ERP Admin",
      email: "admin@erp.local",
      roles: ["SuperAdmin"],
      permissions: [],
    });

    expect(getSession()?.accessToken).toBe("access");
    expect(getSession()?.refreshToken).toBe("refresh");
  });

  it("clears the session after five minutes of inactivity", () => {
    vi.useFakeTimers();
    saveSession({
      accessToken: "access",
      refreshToken: "refresh",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      displayName: "ERP Admin",
      email: "admin@erp.local",
      roles: ["Employee"],
      permissions: ["dashboard.view"],
    });

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    expect(getSession()).toBeNull();
    expect(window.sessionStorage.getItem("erp.session")).toBeNull();
  });

  it("treats SuperAdmin as having all permissions", () => {
    expect(
      hasPermission(
        {
          accessToken: "access",
          refreshToken: "refresh",
          expiresAt: new Date().toISOString(),
          displayName: "ERP Admin",
          email: "admin@erp.local",
          roles: ["SuperAdmin"],
          permissions: [],
          lastActivityAt: Date.now(),
        },
        "sales.setup.create.view",
      ),
    ).toBe(true);
  });
});
