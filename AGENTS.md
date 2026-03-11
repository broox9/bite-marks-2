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
- The project uses **Bun** (`bun.lock`). Bun is installed at `~/.bun/bin/bun` and is on `PATH` via `~/.bashrc`. Use `bun install` for dependency installation. `npm run <script>` still works for running package scripts.

### Environment variables
- Required secrets (`PUBLIC_APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`) are injected as environment variables. `OPENAI_API_KEY` and `SENTRY_AUTH_TOKEN` are also available.
- No `.env` file is needed; SvelteKit picks up the injected env vars directly.

### Running services
- **Dev server:** `npm run dev` starts Vite on `http://localhost:5173/` (binds to `--host` by default).
- **Type/Svelte check:** `npm run check` — expect ~25 pre-existing TS errors; these are in the existing codebase, not regressions.
- **Tests:** `npm run test` runs Vitest (7 test files, 95 tests). Despite `package.json` not mentioning Vitest in its description, it is configured and works.

### Authentication
- The app requires Appwrite email/password login. Without a test account, unauthenticated users are redirected to `/login`. The `/all-spots` route is publicly accessible and proves Appwrite database connectivity.
- To test authenticated flows, a test login account is needed (see `AUTH-README.md` for details).
