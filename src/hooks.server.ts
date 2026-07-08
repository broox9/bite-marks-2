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

  if (!sessionSecret) {
    event.locals.user = null;
  } else {
    try {
      event.locals.user = await event.locals.appwrite.account.get();
    } catch (error) {
      const err = error as { code?: number };
      if (err?.code === 401) {
        clearAppwriteSessionCookie(event.cookies);
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
