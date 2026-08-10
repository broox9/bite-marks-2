# Authentication (Convex + Better Auth)

Auth runs on the **Convex** deployment via the Better Auth component.
The SvelteKit Worker only proxies `/api/auth/*` and reads the JWT cookie.

## Overview

- **Email/password and Google** use Better Auth client methods (`authClient.signIn.*`).
- **SSR**: `hooks.server.ts` reads the JWT with `getToken(event.cookies)` and wraps the request in `withServerConvexToken`.
- **Route guard**: `+layout.server.ts` uses `getAuthState()` (allowlist: `/login`, `/all-spots`, `/api/auth/*`).
- **Data identity**: Convex functions take `ctx.auth.getUserIdentity().subject` as the user id.

## Source of truth

| Role | Path |
|------|------|
| Login UI | `src/routes/login/+page.svelte` |
| Auth client | `src/lib/auth-client.ts` |
| Auth proxy | `src/routes/api/auth/[...all]/+server.ts` |
| Hooks | `src/hooks.server.ts` |
| Layout guard | `src/routes/+layout.server.ts` |
| Better Auth on Convex | `src/convex/auth.ts`, `src/convex/http.ts`, `src/convex/auth.config.ts` |
| Convex component registration | `src/convex/convex.config.ts` |

## Local setup

1. `npx convex dev` (dev deployment already provisioned as `fastidious-setter-628`).
2. Convex env (dev):
   - `BETTER_AUTH_SECRET`
   - `SITE_URL=http://localhost:5173`
   - Optional Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (use a **dev-only** OAuth client; do not rotate the Appwrite prod client yet).
3. `.env.local` (written by Convex + app):
   - `PUBLIC_CONVEX_URL`
   - `PUBLIC_CONVEX_SITE_URL`
   - `PUBLIC_SITE_URL=http://localhost:5173`
   - `USE_CONVEX=1` (local data path)

## Google OAuth (dev)

1. Create a **new** Google Cloud OAuth client (Web application).
2. Authorized redirect URI: `http://localhost:5173/api/auth/callback/google`
3. Set on the Convex **dev** deployment:
   ```bash
   npx convex env set GOOGLE_CLIENT_ID '...'
   npx convex env set GOOGLE_CLIENT_SECRET '...'
   ```
4. Leave the existing Appwrite Google client alone until production cutover.

## Session cookie

Better Auth sets an httpOnly JWT cookie (name includes `better-auth` / Convex JWT cookie).
Do **not** construct `createAuth()` inside the Cloudflare Worker — use `getToken(event.cookies)` only
(avoids better-auth AsyncLocalStorage hangs on workerd).

## Data adapter flag

`getPlaceAndSpotUseCase()` in `src/lib/glue/di-container.ts` selects:

- `USE_CONVEX=1` → `ConvexAdapter` (authenticated ConvexHttpClient)
- otherwise → legacy `AppwriteAdapter` (admin key)

Locally after migration rehearsal, keep `USE_CONVEX=1`.

## Migration scripts

- Export (read-only): `npx tsx scripts/export-appwrite.ts` → `.tmp/migration/`
- Rehearse on **dev** Convex: `npx tsx scripts/rehearse-migration.ts`

Password hashes cannot be exported from Appwrite. Email/password users must reset after cutover.
Google users are pre-linked when `providerUid` is present in the export.

## Production cutover (after local verification)

1. Create prod Convex deployment; set `SITE_URL=https://bite.broox.us` and a fresh `BETTER_AUTH_SECRET`.
2. Create a **prod** Google OAuth client with redirect `https://bite.broox.us/api/auth/callback/google`.
3. Re-run export + import against prod.
4. Deploy Worker with `USE_CONVEX=1` and Convex public URLs in `wrangler.jsonc`.
5. Only then rotate/retire the leaked Appwrite Google client secret and remove Appwrite deps.
