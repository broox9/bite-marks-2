import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { authorizationUseCase as auth } from "$lib/use_cases/authorization";
import {
  clearAppwriteSessionCookie,
  getSessionCookieName,
} from "$lib/adapters/secondary/appwrite/server-client.server";

export const GET: RequestHandler = async (event) => {
  const secret = event.cookies.get(getSessionCookieName()) ?? "";
  try {
    if (secret) await auth.logout(secret);
  } catch {
    // Still clear local cookie so the browser is not stuck in a half state.
  }
  clearAppwriteSessionCookie(event.cookies);
  throw redirect(303, "/login");
};
