# Project Overview

This is a Svelte-based web application migrating from Appwrite to **Convex** (auth + database).
The project follows a hexagonal (ports-and-adapters) architecture within `src/lib`, with SvelteKit
for the framework, Vite for the build tool, and Tailwind CSS installed (prefer CSS variables).

## Key Technologies

- **Frontend:** Svelte, SvelteKit
- **Backend:** Convex (Better Auth + tables); Appwrite still present behind `USE_CONVEX=0` until cutover
- **Build Tool:** Vite
- **Styling:** Tailwind CSS is installed, but do not use it. Use CSS variables and custom properties instead.
- **Language:** TypeScript

## Architecture

- **`src/lib/core/domain`**: Domain types/schemas (core business concepts).
- **`src/lib/use_cases`**: Application use-cases that orchestrate behavior and depend on ports (interfaces), not concrete services.
- **`src/lib/ports`**: Port interfaces (e.g. persistence) that use-cases depend on.
- **`src/lib/adapters/primary`**: Inbound adapters (SvelteKit remote handlers, stores).
- **`src/lib/adapters/secondary`**: Outbound adapters — `convex/` (active when `USE_CONVEX=1`) and `appwrite/` (legacy).
- **`src/lib/glue`**: Composition root (`getPlaceAndSpotUseCase()`).
- **`src/convex`**: Convex schema, queries/mutations, Better Auth, HTTP router.
- **`src/routes`**: SvelteKit UI routes.

## Skills

Project skills live in `.agents/skills/` (`.claude/skills` symlinks to it). Use these copies, not global installs.

| Skill                       | Use for                                                          | Output                                                    |
| --------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `.agents/skills/archify`    | Diagrams (architecture, workflow, sequence, dataflow, lifecycle) | `docs/diagrams/<type>-<slug>-<YYYYMMDD-HHMMSS>/`          |
| `.agents/skills/impeccable` | Design (critique, polish, design system)                         | `docs/design/` (`PRODUCT.md`, `DESIGN.md`, `design.json`) |

## Auth docs

- See [`docs/AUTH-README.md`](docs/AUTH-README.md) for Convex + Better Auth.
- See [`docs/oauth-social-sign-in.md`](docs/oauth-social-sign-in.md) for Google OAuth.

## Pull request naming

Name every pull request and its source branch using `<type>/<issue-number>-<short-description>`.

- Use an appropriate lowercase type, such as `feat`, `fix`, `refactor`, `docs`, `test`, or `chore`.
- Preserve the issue identifier's capitalization, such as `BRO-10`.
- Write a concise, lowercase, hyphen-separated description.
- Example: `feat/BRO-10-save-location`.

## Commit messages

Format every commit message as follows, with a blank line between the subject and body:

```text
<type>[<area of code>]: <issue-number> <short description>

<longer description>
```

- Use an appropriate lowercase type and a concise, lowercase, hyphen-separated code area.
- Preserve the issue identifier's capitalization, such as `BRO-10`.
- Use the body to explain the change and its purpose.

Example:

```text
feat[location-service]: BRO-10 saving location

allowing a user to save multiple locations as a basis of search for spots
```

## Design loop and decision records

Read [`docs/decisions/README.md`](docs/decisions/README.md) before starting any issue. Also read the accepted ADRs in `docs/decisions/adr/` and [`docs/decisions/LESSONS.md`](docs/decisions/LESSONS.md).

Every Linear issue carries one `Loop` label:

- **`Explore`**: the answer is not known. Do not write delivery code.
  - Work on `explore/<issue>-<variant>` branches, for example `explore/BRO-12-selection-first`. Never open a pull request from an `explore/*` branch into `main`; CI blocks it.
  - Create `docs/decisions/hypotheses/<issue>-<slug>/` from `_template/` if it does not exist.
  - Append one notebook entry per experiment. Record every assumption you had to guess under **Guesses**. Never rewrite earlier entries.
  - Challenge the issue itself: if the code or evidence suggests the hypothesis is wrong, say so in the notebook.
  - You may draft `decision.md` with `status: open`. Only Brookes sets `pursue`, `revise` or `stop`.
- **`Deliver`**: the answer is known and can be checked.
  - If the work came from a hypothesis, put `Hypothesis: <issue>` in the PR description. Stay inside the HDR's **Delivery scope**. If you hit an unresolved question, stop and add it to the notebook instead of guessing.
  - Add the instrumentation for the HDR's **Signal** as part of the change.

Architecture changes need an ADR. If a PR touches the paths listed in `docs/decisions/README.md`, or the issue has the `ADR required` label, add or update an ADR (copy `docs/decisions/adr/0000-template.md`), or cite an accepted ADR in the PR description.

Release labels: `Auto-ship` changes are mechanical and merge when checks pass. `Human-gated` changes (auth, data, schema, privacy, public exposure, costly endpoints, new UX) wait for Brookes.

Repair budget: at most two attempts to fix a failing check. Then stop and report the logs and your hypothesis. Never weaken, skip or delete a test or check to make it pass.

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

| Service              | Command              | Notes                                                         |
| -------------------- | -------------------- | ------------------------------------------------------------- |
| SvelteKit dev server | `npm run dev`        | Port **5173** (`--host`).                                     |
| Convex               | `npm run dev:convex` | Dev deployment; required for auth + data when `USE_CONVEX=1`. |
| Appwrite             | (remote)             | Legacy only while `USE_CONVEX=0`.                             |

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

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
