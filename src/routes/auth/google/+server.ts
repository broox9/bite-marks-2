import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { getAppBaseUrl } from "$lib/adapters/secondary/appwrite/app-base-url.server";
import { authorizationUseCase as auth } from "$lib/use_cases/authorization";

export const GET: RequestHandler = async (event) => {
  const base = getAppBaseUrl(event);
  const success = `${base}/auth/google/callback`;
  const failure = `${base}/login?oauth=error`;

  console.log('[OAuth] Initiating Google OAuth flow', { base, success, failure });

  try {
    const redirectUrl = await auth.getGoogleOAuthRedirectUrl(success, failure);
    console.log('[OAuth] Redirecting to:', redirectUrl);
    throw redirect(302, redirectUrl);
  } catch (error) {
    console.error('[OAuth] Failed to get OAuth redirect URL:', error);
    
    if (error instanceof Error && error.message.includes('Invalid redirect')) {
      console.error('[OAuth] Redirect URL validation failed. Check Appwrite Console → Project → Platforms');
      console.error('[OAuth] Ensure these URLs are whitelisted:', { base, success, failure });
    }
    
    throw redirect(303, `${base}/login?oauth=error`);
  }
};
