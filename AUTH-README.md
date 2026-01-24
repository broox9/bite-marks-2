# Authentication System Documentation

## **Warning, this may not make sense yet!**

This project is mid-migration, so there are *two* sets of auth-related folders in the repo. This doc describes the **current, working path** used by the login page and the server hooks.

## Overview

- **Login is server-driven**: the login form submits to a server action, which creates an Appwrite session and sets an HTTP-only cookie.
- **Auth is enforced server-side**: `src/hooks.server.ts` loads the user into `event.locals`, and `src/routes/+layout.server.ts` redirects based on `locals.user`.
- **Hex/ports-adapters style**: UI → remote handler → use-case → repository → Appwrite.

## Source of truth (files)

- **Login UI**: `src/routes/login/+page.svelte`
- **Login action (sets cookie, redirects)**: `src/lib/adapters/primary/remote-handlers/login.remote.ts`
- **Route protection (redirects to/from /login)**: `src/routes/+layout.server.ts`
- **Server hook (hydrates `locals.user`)**: `src/hooks.server.ts`
- **Use case**: `src/lib/use_cases/authorization.ts`
- **Port interface**: `src/lib/ports/auth.repository.ts`
- **Appwrite auth adapter**: `src/lib/adapters/secondary/appwrite/auth.ts`
- **Server-side Appwrite client factories + env**: `src/lib/adapters/secondary/appwrite/server-client.server.ts`

## How login works (happy path)

### 1) User submits the login form

The login page uses SvelteKit form actions (via `loginAction`):

- **File**: `src/routes/login/+page.svelte`
- **Action**: `loginAction` from `src/lib/adapters/primary/remote-handlers/login.remote.ts`

### 2) Server login action creates the Appwrite session + sets the cookie

- **File**: `src/lib/adapters/primary/remote-handlers/login.remote.ts`
- **What it does**:
  - Validates `{ email, password }` with Zod.
  - Calls `authorizationUseCase.login(email, password)`.
  - Sets the session cookie using `auth.getCookieName()`:
    - **Name**: `a_session_${APPWRITE_PROJECT_ID}`
    - **Value**: `session.secret`
    - **Flags**: `httpOnly`, `sameSite: "strict"`, `expires` from Appwrite.
    - **Secure**: `secure: !dev` (secure in prod, not secure in dev).
  - Redirects to `/list`.

### 3) Every request hydrates `locals.user` from the cookie

- **File**: `src/hooks.server.ts`
- **What it does**:
  - Reads `a_session_${APPWRITE_PROJECT_ID}` from cookies.
  - Creates session-scoped Appwrite clients (`Account`, `TablesDB`) using that session secret.
  - Tries `account.get()` and stores the result on `event.locals.user` (or `null` if unauthenticated).

### 4) Route protection is enforced in the server layout

- **File**: `src/routes/+layout.server.ts`
- **Behavior**:
  - If `!locals.user` and you’re not on `/login` → redirect to `/login`
  - If `locals.user` and you are on `/login` → redirect to `/`
  - Otherwise returns `{ user: locals.user }` for the UI

## What “logged in” means in this app

- The “session” is Appwrite’s email/password session.
- The app’s durable auth state is the **HTTP-only cookie**:
  - **Cookie name**: `a_session_${APPWRITE_PROJECT_ID}`
  - **Cookie value**: `session.secret`
- The **server** is the authority for whether a user is logged in, via `hooks.server.ts`.

## Configuration (Appwrite)

Server-side Appwrite config is sourced from env in:

- `src/lib/adapters/secondary/appwrite/server-client.server.ts`

It expects:

- **Public**: `PUBLIC_APPWRITE_ENDPOINT`
- **Private**: `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`

## Migration / legacy notes (why there are duplicate folders)

You may also see older paths like:

- `src/lib/_adapters/*`
- `src/lib/_ports/*`
- `src/lib/_use_cases/*`
- `src/lib/infrastructure/*`

Those are **legacy/migration-era** code paths and may be partially unused. The login page currently imports from the newer `src/lib/adapters/*` path.

## Security notes (important)

- **Do not log secrets**: `src/lib/adapters/secondary/appwrite/server-client.server.ts` currently logs env values (including the API key) to the console. That’s convenient for debugging but risky—remove/redact it before shipping.
- **HTTP-only cookie**: good XSS hardening (JS can’t read the session secret).
- **SameSite strict**: helps reduce CSRF exposure.

## Related docs

- [Appwrite Auth docs](https://appwrite.io/docs/products/auth)
- [SvelteKit form actions](https://kit.svelte.dev/docs/form-actions)
