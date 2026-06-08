import * as Sentry from "@sentry/sveltekit";
import { dev } from "$app/environment";
import type { ErrorEvent as SentryErrorEvent } from "@sentry/core";
import {
    isLocalHostname,
    shouldDropLocalSentryEvent,
} from "$lib/adapters/secondary/sentry/event-filter";

const isLocalBrowser = isLocalHostname(location.hostname);

// If you don't want to use Session Replay, remove the `Replay` integration,
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
Sentry.init({
    dsn: "https://7ab0ec7634448d8b30f20c5bcffb7121@o4510803666927616.ingest.us.sentry.io/4510803670663168",
    enabled: !dev && !isLocalBrowser,
    environment: dev || isLocalBrowser ? "development" : "production",
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.replayIntegration()],
    enableLogs: true,
    sendDefaultPii: true,
    beforeSend(event: SentryErrorEvent) {
        return shouldDropLocalSentryEvent(event) ? null : event;
    },
})

export const handleError = Sentry.handleErrorWithSentry();