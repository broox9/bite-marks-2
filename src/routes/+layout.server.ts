import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const isLoginRoute = url.pathname === "/login";
  const isAllSpotsRoute = url.pathname === "/all-spots";

  if (!locals.user && !isLoginRoute && !isAllSpotsRoute) throw redirect(303, "/login");
  if (locals.user && isLoginRoute) throw redirect(303, "/");

  return { user: locals.user };
};

