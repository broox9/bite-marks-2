# Project Overview

This is a Svelte-based web application that uses Appwrite for its backend services. The project is structured to follow a hexagonal (ports-and-adapters) architecture within `src/lib`, with SvelteKit for the framework, Vite for the build tool, and Tailwind CSS for styling.

## Key Technologies

*   **Frontend:** Svelte, SvelteKit
*   **Backend:** Appwrite
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
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

*   **Code Style:** No ESLint or Prettier configs are currently present in the repo.
*   **Testing:** There are no testing frameworks configured in the `package.json`.
*   **Commits:** There is no commit message convention specified.

## Cursor Cloud specific instructions

### Package manager

The project uses **Bun** (`bun.lock`). Use `bun install` and `bun run <script>` for all dependency and script operations.

### Environment variables

The app requires three Appwrite secrets injected as env vars. For the SvelteKit dev server to pick them up, they must be written to a `.env` file in the project root:
- `PUBLIC_APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`

The update script handles creating `.env` from env vars automatically.

### Running services

| Service | Command | Notes |
|---|---|---|
| Dev server | `bun run dev` | Vite dev server on port 5173. `--host` flag is already in the script. |
| Type check | `bun run check` | Runs `svelte-kit sync && svelte-check`. Pre-existing type errors exist in the codebase. |

### Gotchas

- **No ESLint/Prettier configs exist** despite AGENTS.md previously claiming they did. The only code-quality check available is `bun run check` (Svelte + TypeScript checker).
- **Pre-existing type errors**: `bun run check` currently reports ~17 errors. These are in existing code (e.g. `local_dev/index.ts`, `appwrite/index.ts`, various `.svelte` files) and are not blocking the dev server.
- **Appwrite is remote-only**: There is no local/Docker Appwrite setup. All auth and data go to Appwrite Cloud. Without valid credentials the app still starts but authenticated routes won't work.
- **`svelte.config.js` uses `adapter-cloudflare`**: This is fine for dev (`vite dev` uses its own adapter), but `vite build` produces a Cloudflare Workers bundle, not a Node.js bundle.
- **Login requires an Appwrite account**: To test authenticated flows (spots list, search, tags), you need a valid user account in the connected Appwrite project. Provide `TEST_LOGIN_USERNAME` and `TEST_LOGIN_PASSWORD` secrets for full E2E testing.
