import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { authorizationUseCase as auth } from "$lib/use_cases/authorization";
import { setAppwriteSessionCookie } from "$lib/adapters/secondary/appwrite/server-client.server";
import { agentDebugLog } from "$lib/debug-agent-log.server";

function isValidUserId(value: string | null): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

function isValidOAuthSecret(value: string | null): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 4096;
}

export const GET: RequestHandler = async (event) => {
  const userId = event.url.searchParams.get("userId");
  const secret = event.url.searchParams.get("secret");

  console.log('[OAuth Callback] Received OAuth callback', {
    hasUserId: !!userId,
    hasSecret: !!secret,
    userIdLength: userId?.length,
    secretLength: secret?.length,
  });

  // #region agent log
  agentDebugLog({ runId: "pre-fix", hypothesisId: "H4", location: "callback:+server.ts:params", message: "OAuth callback params", data: { hasUserId: !!userId, userIdLength: userId?.length ?? 0, hasSecret: !!secret, secretLength: secret?.length ?? 0, validUserId: isValidUserId(userId), validSecret: isValidOAuthSecret(secret), queryKeys: [...event.url.searchParams.keys()] } });
  // #endregion

  if (!isValidUserId(userId) || !isValidOAuthSecret(secret)) {
    console.error('[OAuth Callback] Invalid OAuth parameters');
    throw redirect(303, "/login?oauth=invalid");
  }

  try {
    console.log('[OAuth Callback] Creating session for user:', userId);
    const session = await auth.completeOAuthLogin(userId, secret);
    // #region agent log
    agentDebugLog({ runId: "pre-fix", hypothesisId: "H2-H3", location: "callback:+server.ts:session-created", message: "createSession succeeded", data: { hasSessionSecret: !!session?.secret, sessionSecretLength: session?.secret?.length ?? 0, hasExpire: !!session?.expire } });
    // #endregion
    console.log('[OAuth Callback] Session created successfully');
    
    setAppwriteSessionCookie(event.cookies, session);
    // #region agent log
    agentDebugLog({ runId: "pre-fix", hypothesisId: "H3", location: "callback:+server.ts:cookie-set", message: "session cookie set before redirect", data: { cookieName: auth.getCookieName() } });
    // #endregion
    console.log('[OAuth Callback] Session cookie set, redirecting to /list');
  } catch (error) {
    const err = error as { type?: string; code?: number; message?: string };
    // #region agent log
    agentDebugLog({ runId: "pre-fix", hypothesisId: "H2", location: "callback:+server.ts:createSession-error", message: "createSession failed", data: { errorType: err?.type, errorCode: err?.code, errorMessage: err?.message } });
    // #endregion
    console.error('[OAuth Callback] Failed to complete OAuth login:', error);
    throw redirect(303, "/login?oauth=failed");
  }

  throw redirect(303, "/list");
};
