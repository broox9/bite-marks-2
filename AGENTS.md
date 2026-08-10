# Project Overview

This is a Svelte-based web application migrating from Appwrite to **Convex** (auth + database).
The project follows a hexagonal (ports-and-adapters) architecture within `src/lib`, with SvelteKit
for the framework, Vite for the build tool, and Tailwind CSS installed (prefer CSS variables).

## Key Technologies

*   **Frontend:** Svelte, SvelteKit
*   **Backend:** Convex (Better Auth + tables); Appwrite still present behind `USE_CONVEX=0` until cutover
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS is installed, but do not use it. Use CSS variables and custom properties instead.
*   **Language:** TypeScript

## Architecture

*   **`src/lib/core/domain`**: Domain types/schemas (core business concepts).
*   **`src/lib/use_cases`**: Application use-cases that orchestrate behavior and depend on ports (interfaces), not concrete services.
*   **`src/lib/ports`**: Port interfaces (e.g. persistence) that use-cases depend on.
*   **`src/lib/adapters/primary`**: Inbound adapters (SvelteKit remote handlers, stores).
*   **`src/lib/adapters/secondary`**: Outbound adapters — `convex/` (active when `USE_CONVEX=1`) and `appwrite/` (legacy).
*   **`src/lib/glue`**: Composition root (`getPlaceAndSpotUseCase()`).
*   **`src/convex`**: Convex schema, queries/mutations, Better Auth, HTTP router.
*   **`src/routes`**: SvelteKit UI routes.

## Auth docs

- See [`docs/AUTH-README.md`](docs/AUTH-README.md) for Convex + Better Auth.
- See [`docs/oauth-social-sign-in.md`](docs/oauth-social-sign-in.md) for Google OAuth.

# Building and Running

## Development

Run Convex and Vite together:

```bash
npm run dev:convex   # terminal 1 — watches/pushes Convex functions
npm run dev          # terminal 2 — SvelteKit on :5173
```

Or: `npm run dev:all` (Convex in background + Vite).

Ensure `.env.local` has `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`, `PUBLIC_SITE_URL`, and `USE_CONVEX=1`.

## Building

```bash
npm run build
npm run preview
# Worker preview (catches workerd/AsyncLocalStorage issues):
npm run preview:worker
```

## Checking / tests

```bash
npm run check
npm test
```

# Migration scripts

```bash
npx tsx scripts/export-appwrite.ts      # read-only dump → .tmp/migration/
npx tsx scripts/rehearse-migration.ts  # import into DEV Convex
```

# Cursor Cloud specific instructions

### Services

| Service | Command | Notes |
|---------|---------|-------|
| SvelteKit dev server | `npm run dev` | Port **5173** (`--host`). |
| Convex | `npm run dev:convex` | Dev deployment; required for auth + data when `USE_CONVEX=1`. |
| Appwrite | (remote) | Legacy only while `USE_CONVEX=0`. |

### Environment

- Convex: `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`, `PUBLIC_SITE_URL`, `USE_CONVEX`
- Convex deployment secrets: `BETTER_AUTH_SECRET`, `SITE_URL`, optional `GOOGLE_CLIENT_*`
- Legacy Appwrite (until cutover): `PUBLIC_APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`

### Verify without login

- `/` redirects unauthenticated users to `/login` (303).
- `/all-spots` is public (master places catalog).

### Commands

- **Typecheck:** `npm run check`
- **Tests:** `npm test` (Vitest)
- **Build:** `npm run build` (Cloudflare adapter)
