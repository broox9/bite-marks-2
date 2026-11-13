import { safeRedirectTo } from "./redirect";

/**
 * Where to send this request, or null to render the page.
 *
 * A Convex JWT cookie makes `getAuthState().isAuthenticated` true even when
 * `getCurrentUser` returns null. Protected pages must follow the loaded user,
 * not the cookie, or they render with `user === null`.
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
