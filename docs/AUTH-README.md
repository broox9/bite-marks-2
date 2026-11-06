# Authentication (Convex + Better Auth)

Authentication runs on the Convex deployment through the Better Auth component. The SvelteKit
Worker proxies `/api/auth/*` and reads the JWT cookie.

## Overview

- Email/password and Google sign-in use `authClient.signIn.*`.
- `hooks.server.ts` reads the JWT with `getToken(event.cookies)` and wraps requests with
  `withServerConvexToken`.
- `+layout.server.ts` guards routes while allowing `/login`, `/all-spots`, and `/api/auth/*`.
- Convex functions use `ctx.auth.getUserIdentity().subject` as the user ID.

## Source of truth

| Role | Path |
| --- | --- |
| Login UI | `src/routes/login/+page.svelte` |
| Auth client | `src/lib/auth-client.ts` |
| Auth proxy | `src/routes/api/auth/[...all]/+server.ts` |
| Hooks | `src/hooks.server.ts` |
| Layout guard | `src/routes/+layout.server.ts` |
| Better Auth | `src/convex/auth.ts`, `src/convex/http.ts`, `src/convex/auth.config.ts` |
| Component registration | `src/convex/convex.config.ts` |

## Local setup

1. Run `npm run dev:convex`.
2. Set `BETTER_AUTH_SECRET` and `SITE_URL=http://localhost:5173` on the Convex development
   deployment.
3. Set `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`, and
   `PUBLIC_SITE_URL=http://localhost:5173` in `.env.local`.
4. Run `npm run dev`.

## Google OAuth

Create separate Google Cloud OAuth clients for development and production.

| Environment | Redirect URI |
| --- | --- |
| Development | `http://localhost:5173/api/auth/callback/google` |
| Production | `https://bite.broox.us/api/auth/callback/google` |

Set credentials on the matching Convex deployment:

```bash
npx convex env set GOOGLE_CLIENT_ID '...'
npx convex env set GOOGLE_CLIENT_SECRET '...'
```

## Session cookie

Better Auth sets an HTTP-only JWT cookie. Do not construct `createAuth()` inside the Cloudflare
Worker; use `getToken(event.cookies)` to avoid AsyncLocalStorage hangs on workerd.

## Persistence

`getPlaceAndSpotUseCase()` creates an authenticated `ConvexAdapter` for every request. Convex is
the only authentication and persistence backend.
