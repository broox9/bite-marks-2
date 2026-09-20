import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getAuthState } from "@mmailaender/convex-better-auth-svelte/sveltekit";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const authState = getAuthState();
  const isLoginRoute = url.pathname === "/login";
  const isAllSpotsRoute = url.pathname === "/all-spots";
  const isAuthApiRoute = url.pathname.startsWith("/api/auth");
  const isConnectorLogin = url.pathname === '/connect/login';

  if (
    !authState.isAuthenticated &&
    !isLoginRoute &&
    !isAllSpotsRoute &&
    !isAuthApiRoute && !isConnectorLogin
  ) {
    throw redirect(303, "/login");
  }
  if (authState.isAuthenticated && isLoginRoute) throw redirect(303, "/");

  return { authState, user: locals.user };
};
