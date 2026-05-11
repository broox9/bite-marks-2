import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const isLoginRoute = url.pathname === "/login";
  const isAllSpotsRoute = url.pathname === "/all-spots";
  const isGoogleOAuthRoute = url.pathname.startsWith("/auth/google");
  const isLogoutRoute = url.pathname === "/logout";

  if (
    !locals.user &&
    !isLoginRoute &&
    !isAllSpotsRoute &&
    !isGoogleOAuthRoute &&
    !isLogoutRoute
  ) {
    throw redirect(303, "/login");
  }
  if (locals.user && (isLoginRoute || isGoogleOAuthRoute)) throw redirect(303, "/");

  return { user: locals.user };
};

