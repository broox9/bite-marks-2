import { describe, expect, it } from "vite-plus/test";
import { decideSessionRedirect } from "./session-gate";

describe("decideSessionRedirect", () => {
  it("sends a cookie without a user away from protected pages", () => {
    expect(decideSessionRedirect({ pathname: "/settings", hasUser: false, redirectTo: null })).toBe(
      "/login",
    );
    expect(decideSessionRedirect({ pathname: "/", hasUser: false, redirectTo: null })).toBe(
      "/login",
    );
    expect(decideSessionRedirect({ pathname: "/list", hasUser: false, redirectTo: null })).toBe(
      "/login",
    );
  });

  it("leaves public pages available without a user", () => {
    for (const pathname of ["/login", "/all-spots", "/p/place-1", "/api/auth/callback/google"]) {
      expect(decideSessionRedirect({ pathname, hasUser: false, redirectTo: null })).toBeNull();
    }
  });

  it("lets a signed-in user open settings", () => {
    expect(
      decideSessionRedirect({ pathname: "/settings", hasUser: true, redirectTo: null }),
    ).toBeNull();
  });

  it("sends a signed-in user away from login, and only to a local path", () => {
    expect(
      decideSessionRedirect({
        pathname: "/login",
        hasUser: true,
        redirectTo: "/settings",
      }),
    ).toBe("/settings");
    expect(
      decideSessionRedirect({
        pathname: "/login",
        hasUser: true,
        redirectTo: "https://example.com",
      }),
    ).toBe("/");
  });
});
