import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { authorizationUseCase as auth } from "$lib/use_cases/authorization";
import { setAppwriteSessionCookie } from "$lib/adapters/secondary/appwrite/server-client.server";

function isValidUserId(value: string | null): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

function isValidOAuthSecret(value: string | null): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 4096;
}

export const GET: RequestHandler = async (event) => {
  const userId = event.url.searchParams.get("userId");
  const secret = event.url.searchParams.get("secret");

  if (!isValidUserId(userId) || !isValidOAuthSecret(secret)) {
    throw redirect(303, "/login?oauth=invalid");
  }

  try {
    const session = await auth.completeOAuthLogin(userId, secret);
    setAppwriteSessionCookie(event.cookies, session);
  } catch {
    throw redirect(303, "/login?oauth=failed");
  }

  throw redirect(303, "/list");
};
