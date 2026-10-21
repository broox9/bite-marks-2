import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getAuthState } from "@mmailaender/convex-better-auth-svelte/sveltekit";
import { safeRedirectTo } from "$lib/utils/redirect";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const authState = getAuthState();
  const isLoginRoute = url.pathname === "/login";
  const isAllSpotsRoute = url.pathname === "/all-spots";
  const isPublicSpotRoute = url.pathname.startsWith("/p/");
  const isAuthApiRoute = url.pathname.startsWith("/api/auth");

  if (
    !authState.isAuthenticated &&
    !isLoginRoute &&
    !isAllSpotsRoute &&
    !isPublicSpotRoute &&
    !isAuthApiRoute
  ) {
    throw redirect(303, "/login");
  }
  if (authState.isAuthenticated && isLoginRoute) {
    throw redirect(303, safeRedirectTo(url.searchParams.get("redirectTo"), "/"));
  }

  return { authState, user: locals.user };
};
