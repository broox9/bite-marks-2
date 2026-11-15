import { safeRedirectTo } from "./redirect";

/**
 * Where to send this request, or null to render the page.
 *
 * Per ADR-0002 (`docs/decisions/adr/0002-gate-sessions-on-resolved-user.md`),
 * a Convex JWT cookie makes `getAuthState().isAuthenticated` true even when
 * `getCurrentUser` returns null or throws. Protected pages and `/login` must
 * follow the resolved user (`locals.user != null`), not the cookie flag, so
 * protected routes never render with `user === null` and `/login` does not
 * bounce a stale cookie back into the app.
 */
export function decideSessionRedirect(input: {
  pathname: string;
  hasUser: boolean;
  redirectTo: string | null;
}): string | null {
  const isLoginRoute = input.pathname === "/login";
  const isPublic =
    isLoginRoute ||
    input.pathname === "/all-spots" ||
    input.pathname.startsWith("/p/") ||
    input.pathname.startsWith("/api/auth");

  if (!input.hasUser && !isPublic) return "/login";
  if (input.hasUser && isLoginRoute) return safeRedirectTo(input.redirectTo, "/");
  return null;
}
