# Bite Marks

A restaurant bookmarking web application built with SvelteKit, Convex, Better Auth, and
Cloudflare Workers.

## Features

- Email/password and Google authentication
- Restaurant discovery and bookmarking
- Google Maps integration
- Tags for organizing restaurants
- Responsive design

## Prerequisites

- Node.js 22+
- npm 11+
- A Convex deployment
- Google Cloud credentials for OAuth and Maps

## Package manager

This repository uses **npm**. `package-lock.json` is the authoritative lockfile, CI installs
dependencies with `npm ci`, and all project commands use npm scripts.

## Setup

```bash
npm ci
cp .env.example .env.local
npm run dev:convex
```

In a second terminal:

```bash
npm run dev
```

Configure these application variables in `.env.local`:

```bash
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
PUBLIC_SITE_URL=http://localhost:5173
```

Set `BETTER_AUTH_SECRET`, `SITE_URL`, and optional Google OAuth credentials on the matching
Convex deployment. See `docs/AUTH-README.md` and `docs/oauth-social-sign-in.md`.

## Architecture

The application follows a ports-and-adapters architecture:

- `src/lib/core/domain`: domain types and schemas
- `src/lib/use_cases`: application orchestration
- `src/lib/ports`: persistence interfaces
- `src/lib/adapters/primary`: SvelteKit handlers and stores
- `src/lib/adapters/secondary`: Convex and Google integrations
- `src/lib/glue`: composition root
- `src/convex`: schema, functions, Better Auth, and HTTP routes

Cloudflare Workers deployments use `@sveltejs/adapter-cloudflare`.

## Quality checks

```bash
npm run check
npm test
npm run build
```

## Deployment

```bash
npm run preview:worker
npm run deploy
```

Deployment requires the Cloudflare and Convex environment configuration described in
`.env.example` and `wrangler.jsonc`.
