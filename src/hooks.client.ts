import * as Sentry from "@sentry/sveltekit";

// If you don't want to use Session Replay, remove the `Replay` integration,
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
Sentry.init({
    dsn: "https://7ab0ec7634448d8b30f20c5bcffb7121@o4510803666927616.ingest.us.sentry.io/4510803670663168",
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.replayIntegration()],
    enableLogs: true,
    sendDefaultPii: true
})

export const handleError = Sentry.handleErrorWithSentry();