---
id: ADR-0002
title: Gate protected routes on the resolved session user, not the auth cookie
status: accepted
date: 2026-11-15
deciders: [Brookes]
related: [BITE-MARKS-2-2F]
supersedes:
superseded_by:
---

# ADR-0002: Gate protected routes on the resolved session user, not the auth cookie

## Context

`@mmailaender/convex-better-auth-svelte/sveltekit` reports `getAuthState().isAuthenticated === true` whenever a Convex JWT cookie (`better-auth.convex_jwt`) is present on the request, without verifying the token or resolving a user record.

In `src/hooks.server.ts`, the server reads that cookie via `getToken(event.cookies)` and queries Convex (`api.auth.getCurrentUser`) to populate `event.locals.user`. When a cookie is expired, malformed, or revoked, or when `getCurrentUser` returns `null` or throws, `getAuthState().isAuthenticated` stays `true` while `event.locals.user` (and therefore `page.data.user`) is `null`.

Previously, `src/routes/+layout.server.ts` gated protected routes on `authState.isAuthenticated`. Requests carrying a stale or invalid JWT cookie bypassed the `/login` redirect and rendered protected pages such as `/settings` with `page.data.user === null`, crashing during render when reading `user.id` (`TypeError: Cannot read properties of null (reading 'id')`).

## Options considered

1. **Gate routes on `getAuthState().isAuthenticated` (cookie presence).** Avoids waiting on user resolution for route redirects, but treats stale, revoked, or malformed cookies as signed-in sessions. Protected pages render with `user === null`, and redirecting to `/login` from a page would immediately bounce back into the app because `/login` also sees `isAuthenticated === true`.
2. **Clear the auth cookie in `hooks.server.ts` whenever `getCurrentUser` returns `null`.** Reconciles cookie state after permanent invalidation, but signs the user out permanently on transient Convex lookup errors and still requires in-request route guards not to trust the incoming cookie header.
3. **Gate protected routes on `locals.user != null` and guard nullable `user` reads in components.** Route access in `+layout.server.ts` (via `decideSessionRedirect` in `src/lib/utils/session-gate.ts`) follows whether `hooks.server.ts` resolved a user (`locals.user != null`). `getAuthState()` is returned only for Convex client wiring, and components guard `page.data.user` before reading `user.id`.

## Decision

Option 3. `event.locals.user` is the single source of truth for whether a request has an authenticated user session across server loads, route guards (`decideSessionRedirect`), and remote handlers. Protected routes require `locals.user != null`, `/login` only redirects away when `locals.user != null`, and UI components must check `page.data.user` before accessing properties such as `user.id`.

## Consequences

- Requests with a missing, expired, or unresolvable JWT cookie have `locals.user === null` and are redirected (`303`) to `/login` on protected routes instead of rendering with `page.data.user === null`.
- `/login` stays reachable when a stale `better-auth.convex_jwt` cookie is present (`locals.user === null`), avoiding a redirect loop between `/login` and protected routes and allowing the user to sign in cleanly.
- A transient `getCurrentUser` failure in `hooks.server.ts` sets `locals.user = null` and redirects protected routes to `/login` for that request without deleting the cookie.
- Components that consume `page.data.user` must treat it as nullable and guard queries or property reads (such as `listSavedLocations({ userId: user.id })` on `/settings`).

## Evidence

- Sentry issue `BITE-MARKS-2-2F` (`https://solobroox.sentry.io/issues/7845501543/`): `TypeError: Cannot read properties of null (reading 'id')` on `/settings`.
- Unit tests in `src/lib/utils/session-gate.test.ts`.
