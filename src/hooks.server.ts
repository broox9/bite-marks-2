import { sequence } from "@sveltejs/kit/hooks";
import { dev } from "$app/environment";
import type { ErrorEvent as SentryErrorEvent } from "@sentry/core";
import {
  initCloudflareSentryHandle,
  sentryHandle,
  handleErrorWithSentry,
  // consoleLoggingIntegration,
} from "@sentry/sveltekit";
import type { Handle } from "@sveltejs/kit";
import {
  getSessionCookieName,
  createSessionAccount,
  createSessionTablesDB,
  clearAppwriteSessionCookie,
} from "$lib/adapters/secondary/appwrite/server-client.server";
import { shouldDropLocalSentryEvent } from "$lib/adapters/secondary/sentry/event-filter";
import { agentDebugLog } from "$lib/debug-agent-log.server";

const sentryOptions = {
  dsn: "https://7ab0ec7634448d8b30f20c5bcffb7121@o4510803666927616.ingest.us.sentry.io/4510803670663168",
  enabled: !dev,
  environment: dev ? "development" : "production",
  tracesSampleRate: 1.0,
  enableLogs: true,
  beforeSend(event: SentryErrorEvent) {
    return shouldDropLocalSentryEvent(event) ? null : event;
  },
  // integrations: [
  //   consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  // ],
};

export const handle: Handle = sequence(
  initCloudflareSentryHandle(sentryOptions),
  sentryHandle(),
  async ({ event, resolve }) => {
  const sessionSecret = event.cookies.get(getSessionCookieName()) ?? "";

  event.locals.appwrite = {
    account: createSessionAccount(sessionSecret),
    tablesDB: createSessionTablesDB(sessionSecret),
  };

  // #region agent log
  agentDebugLog({ runId: "post-fix", hypothesisId: "H1-H3-H5", location: "hooks.server.ts:pre-get", message: "hooks before account.get", data: { pathname: event.url.pathname, hasSessionCookie: sessionSecret.length > 0, sessionSecretLength: sessionSecret.length, cookieName: getSessionCookieName(), hasOAuthParams: event.url.searchParams.has("userId") || event.url.searchParams.has("secret") } });
  // #endregion

  if (!sessionSecret) {
    event.locals.user = null;
    // #region agent log
    agentDebugLog({ runId: "post-fix", hypothesisId: "H1", location: "hooks.server.ts:no-cookie", message: "skipped account.get (no session cookie)", data: { pathname: event.url.pathname } });
    // #endregion
  } else {
    try {
      event.locals.user = await event.locals.appwrite.account.get();
      // #region agent log
      agentDebugLog({ runId: "post-fix", hypothesisId: "H1", location: "hooks.server.ts:get-success", message: "account.get succeeded", data: { pathname: event.url.pathname, userId: event.locals.user?.$id } });
      // #endregion
    } catch (error) {
      const err = error as { type?: string; code?: number; message?: string };
      // #region agent log
      agentDebugLog({ runId: "post-fix", hypothesisId: "H3-H5", location: "hooks.server.ts:get-error", message: "account.get failed", data: { pathname: event.url.pathname, sessionSecretLength: sessionSecret.length, errorType: err?.type, errorCode: err?.code, errorMessage: err?.message } });
      // #endregion
      if (err?.code === 401) {
        clearAppwriteSessionCookie(event.cookies);
        // #region agent log
        agentDebugLog({ runId: "post-fix", hypothesisId: "H5", location: "hooks.server.ts:cleared-stale-cookie", message: "cleared invalid session cookie", data: { pathname: event.url.pathname, errorType: err?.type } });
        // #endregion
      } else {
        console.error('[bs] HOOKS::SERVER::error', error);
      }
      event.locals.user = null;
    }
  }

  return resolve(event);
  }
);
export const handleError = handleErrorWithSentry();