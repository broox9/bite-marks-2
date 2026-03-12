# Project Overview

This is a Svelte-based web application that uses Appwrite for its backend services. The project is structured to follow a hexagonal (ports-and-adapters) architecture within `src/lib`, with SvelteKit for the framework, Vite for the build tool, and Tailwind CSS for styling.

## Key Technologies

*   **Frontend:** Svelte, SvelteKit
*   **Backend:** Appwrite
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS is installed, but do not use it. Use CSS variables and custom properties instead.
*   **Language:** TypeScript

## Architecture

The project follows a hexagonal (ports-and-adapters) architecture:

*   **`src/lib/core/domain`**: Domain types/schemas (core business concepts).
*   **`src/lib/use_cases`**: Application use-cases that orchestrate behavior and depend on ports (interfaces), not concrete services.
*   **`src/lib/ports`**: Port interfaces (e.g. persistence/auth) that use-cases depend on.
*   **`src/lib/adapters/primary`**: Inbound adapters (how the UI/server calls into the app), such as SvelteKit remote handlers and Svelte stores/drivers.
*   **`src/lib/adapters/secondary`**: Outbound adapters (how the app talks to external systems), such as Appwrite and Google integrations.
*   **`src/lib/glue`**: Composition root / dependency injection wiring (e.g. binds use-cases to concrete adapters).
*   **`src/lib/the_clean`**: Legacy clean-architecture implementation kept for reference during/after the migration.
*   **`src/routes`**: Svelte components/routes that make up the user interface.

## Auth docs

- See `AUTH-README.md` for how login/session auth works in this repo.

# Building and Running

## Development

To start the development server, run:

```bash
npm run dev
```

Or to open the app in a new browser tab:

```bash
npm run dev -- --open
```

## Building

To create a production version of the app, run:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Checking

To run the Svelte and TypeScript checkers, run:

```bash
npm run check
```

# Development Conventions

*   **Code Style:** The project uses Prettier for code formatting (inferred from `.prettierrc`) and ESLint for linting (inferred from `.eslintrc.cjs`).
*   **Testing:** There are no testing frameworks configured in the `package.json`.
*   **Commits:** There is no commit message convention specified.

## Skills

### Available skills
- `frontend-design`: Create distinctive, production-grade frontend interfaces with high design quality for component/page/application build requests. (file: `/Users/brooxm2/projects/bite-marks-2/skills/frontend-design/SKILL.md`)

## Cursor Cloud specific instructions

### Package manager
The project uses **Bun** (lockfile: `bun.lock`). Use `bun install`, `bun run dev`, `bun run test`, etc. The `package.json` scripts reference `npm run` but all work via `bun run` as well.

### Required environment variables
The following secrets must be configured for the app to connect to Appwrite:
- `PUBLIC_APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`

Optional: `OPENAI_API_KEY` (only needed for the `/agent` chat route).

### Running services
- **Dev server:** `bun run dev` — starts Vite on `http://localhost:5173`
- The app requires no local databases or Docker containers; all persistence is via remote Appwrite.
- Google Maps API key and Mapbox token are hardcoded in `src/app.html` and `src/lib/constants.ts`.

### Checks, tests, build
- `bun run check` — runs `svelte-kit sync && svelte-check`. There are ~25 pre-existing TS/Svelte errors in the codebase; these are not regressions.
- `bun run test` — runs `vitest run` (95 tests across 7 files).
- `bun run build` — production build (uses Cloudflare adapter). Note: this will fail without the Cloudflare-specific build environment; use the dev server for local testing.
- No ESLint config file exists in the repo despite `AGENTS.md` mentioning it; there is no separate lint command.

### Auth flow
Unauthenticated requests to any route (except `/login` and `/all-spots`) redirect to `/login`. The `/all-spots` page is public and fetches data from Appwrite without auth — useful for quick smoke-testing.
