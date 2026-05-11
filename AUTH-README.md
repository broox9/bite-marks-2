# Authentication System Documentation

## **Warning, this may not make sense yet!**

This project is mid-migration, so there are *two* sets of auth-related folders in the repo. This doc describes the **current, working path** used by the login page and the server hooks.

## Overview

- **Login is server-driven**: email/password uses a SvelteKit remote form action; Google uses server routes that set the same HTTP-only session cookie.
- **Auth is enforced server-side**: `src/hooks.server.ts` loads the user into `event.locals`, and `src/routes/+layout.server.ts` redirects based on `locals.user`.
- **Hex/ports-adapters style**: UI → remote handler / routes → use-case → repository → Appwrite.

## Source of truth (files)

- **Login UI**: `src/routes/login/+page.svelte`
- **Email login action (sets cookie, redirects)**: `src/lib/adapters/primary/remote-handlers/login.remote.ts`
- **Google OAuth start**: `src/routes/auth/google/+server.ts`
- **Google OAuth callback (session + cookie)**: `src/routes/auth/google/callback/+server.ts`
- **Logout (delete Appwrite session + clear cookie)**: `src/routes/logout/+server.ts`
- **Route protection**: `src/routes/+layout.server.ts`
- **Server hook (hydrates `locals.user`)**: `src/hooks.server.ts`
- **Use case**: `src/lib/use_cases/authorization.ts`
- **Port interface**: `src/lib/ports/auth.repository.ts`
- **Appwrite auth adapter**: `src/lib/adapters/secondary/appwrite/auth.ts`
- **Session cookie helpers + Appwrite clients**: `src/lib/adapters/secondary/appwrite/server-client.server.ts`
- **Public base URL for OAuth redirects**: `src/lib/adapters/secondary/appwrite/app-base-url.server.ts` (`PUBLIC_APP_URL` optional)

## How email/password login works

1. User submits the login form (`loginAction` on `src/routes/login/+page.svelte`).
2. `login.remote.ts` validates with Zod, calls `authorizationUseCase.login`, then `setAppwriteSessionCookie` and redirects to `/list`.

## How Google OAuth works (server-side, Appwrite SSR pattern)

Matches [Appwrite SSR — OAuth2](https://appwrite.io/docs/products/auth/server-side-rendering#oauth2):

1. User opens **`GET /auth/google`**, which calls `createOAuth2Token` (Google) with **success** = `{origin}/auth/google/callback` and **failure** = `{origin}/login?oauth=error`.
2. Appwrite redirects the browser through Google, then back to the **success** URL with **`userId`** and **`secret`** query parameters.
3. **`GET /auth/google/callback`** reads those params, calls `createSession({ userId, secret })`, sets the same session cookie as email login, and redirects to `/list`.

**Appwrite Console (you must configure):**

1. **Auth → Providers → Google**: enable and paste **Client ID** and **Client secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client). Use the **Authorized redirect URI** shown in the Appwrite Google provider settings (Google redirects to Appwrite, not directly to your app).
2. **Project → Platforms**: ensure your dev and production **hostnames** are allowed; OAuth `success` / `failure` URLs must use hostnames listed there (Appwrite blocks open redirects otherwise).
3. **API keys**: the server API key used in `APPWRITE_API_KEY` needs permission to create sessions (see Appwrite docs: e.g. **`sessions.write`** scope for session-related server calls).

**Session length (~1 week):**

- In Appwrite **Auth → Security** (wording may vary by version), set **session length** to **7 days** (or equivalent).
- The app sets the browser cookie **`expires`** from Appwrite’s `session.expire`, so new logins pick up the new TTL automatically. Existing sessions keep their original expiry until they expire or the user logs out.

## Session cookie

- **Name**: `a_session_${APPWRITE_PROJECT_ID}` (see `getSessionCookieName()`).
- **Value**: `session.secret` from Appwrite.
- **Flags**: `httpOnly`, `path: /`, `secure: !dev`, **`sameSite: "lax"`** (used for both email and OAuth). `lax` avoids issues where the session cookie would not be sent on the **first** navigation back from the OAuth provider when using `strict`.

## `PUBLIC_APP_URL` (optional)

OAuth success/failure URLs must be absolute. By default the app uses `event.url.origin`. If you are behind a reverse proxy or need a fixed canonical URL (e.g. production only), set **`PUBLIC_APP_URL`** (no trailing slash), e.g. `https://yourdomain.com`. Implemented in `app-base-url.server.ts`.

## Route protection (`+layout.server.ts`)

Unauthenticated users may access:

- `/login`
- `/all-spots`
- Paths under **`/auth/google`** (OAuth start + callback)
- **`/logout`** (no-op clear + redirect if already signed out)

If `locals.user` is set, **`/login`** and **`/auth/google`** redirect to **`/`**.

## Logout

- **`GET /logout`**: deletes the current Appwrite session using the cookie secret, clears the session cookie, redirects to `/login`.
- The main layout footer uses `goto("/logout")` so the server clears the **httpOnly** cookie (browser-only `Account.deleteSession` is not sufficient for this setup).

## What “logged in” means

- The durable state is the **HTTP-only Appwrite session cookie**; `hooks.server.ts` calls `account.get()` with a session-scoped client to populate `locals.user`.

## Configuration (env)

From `server-client.server.ts` and `app-base-url.server.ts`:

- **Public**: `PUBLIC_APPWRITE_ENDPOINT`, optional `PUBLIC_APP_URL`
- **Private**: `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`

## Migration / legacy notes (why there are duplicate folders)

You may also see older paths like:

- `src/lib/_adapters/*`
- `src/lib/_ports/*`
- `src/lib/_use_cases/*`
- `src/lib/infrastructure/*`

Those are **legacy/migration-era** code paths and may be partially unused. The login page currently imports from the newer `src/lib/adapters/*` path.

## Security notes (important)

- **Do not log secrets**: avoid logging `APPWRITE_API_KEY` or session secrets.
- **HTTP-only cookie**: JS cannot read the session secret (XSS hardening).
- **`sameSite: lax`**: slightly broader cookie send behavior than `strict`; required for reliable OAuth return + still limits many cross-site cookie scenarios.

## Related docs

- [Appwrite Auth](https://appwrite.io/docs/products/auth)
- [Appwrite SSR / OAuth2](https://appwrite.io/docs/products/auth/server-side-rendering#oauth2)
- [SvelteKit form actions](https://kit.svelte.dev/docs/form-actions)
