import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getAuthState } from "@mmailaender/convex-better-auth-svelte/sveltekit";
import { decideSessionRedirect } from "$lib/utils/session-gate";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const authState = getAuthState();
  const destination = decideSessionRedirect({
    pathname: url.pathname,
    hasUser: locals.user != null,
    redirectTo: url.searchParams.get("redirectTo"),
  });
  if (destination) throw redirect(303, destination);

  return { authState, user: locals.user };
};
