import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { getAppBaseUrl } from "$lib/adapters/secondary/appwrite/app-base-url.server";
import { authorizationUseCase as auth } from "$lib/use_cases/authorization";

export const GET: RequestHandler = async (event) => {
  const base = getAppBaseUrl(event);
  const success = `${base}/auth/google/callback`;
  const failure = `${base}/login?oauth=error`;

  const redirectUrl = await auth.getGoogleOAuthRedirectUrl(success, failure);
  throw redirect(302, redirectUrl);
};
