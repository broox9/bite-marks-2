import { sequence } from "@sveltejs/kit/hooks";
import { dev } from "$app/environment";
import type { ErrorEvent as SentryErrorEvent } from "@sentry/core";
import {
  initCloudflareSentryHandle,
  sentryHandle,
  handleErrorWithSentry,
} from "@sentry/sveltekit";
import type { Handle } from "@sveltejs/kit";
import {
  createConvexHttpClient,
  getToken,
} from "@mmailaender/convex-better-auth-svelte/sveltekit";
import { withServerConvexToken } from "convex-svelte/sveltekit/server";
import { api } from "$convex/_generated/api";
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
};

export const handle: Handle = sequence(
  initCloudflareSentryHandle(sentryOptions),
  sentryHandle(),
  async ({ event, resolve }) => {
    const token = getToken(event.cookies);
    event.locals.token = token;

    return withServerConvexToken(token, async () => {
      if (!token) {
        event.locals.user = null;
      } else {
        try {
          const client = createConvexHttpClient();
          const raw = (await client.query(api.auth.getCurrentUser, {})) as
            | { id?: string; _id?: string; email?: string | null; name?: string | null }
            | null;
          event.locals.user = raw
            ? {
                id: String(raw.id ?? raw._id),
                email: raw.email ?? null,
                name: raw.name ?? null,
              }
            : null;
        } catch (error) {
          console.error("[bs] HOOKS::SERVER::auth", error);
          event.locals.user = null;
        }
      }
      return resolve(event);
    });
  }
);

export const handleError = handleErrorWithSentry();
