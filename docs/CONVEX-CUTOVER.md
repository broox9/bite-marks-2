# Convex production cutover plan

This runbook moves Bite Marks authentication and database persistence from Appwrite to Convex + Better Auth. It is a release plan, not a claim that the current PR is ready to deploy.

Primary tracker: [BRO-34 — Ship Convex auth and persistence cutover safely](https://linear.app/brookes-personal/issue/BRO-34/ship-convex-auth-and-persistence-cutover-safely)

Implementation PR: [#38 — Convex auth and persistence migration](https://github.com/broox9/bite-marks-2/pull/38)

## Release rule

Do **not** merge or deploy PR #38 until every pre-cutover gate below is complete and its evidence is recorded. Appwrite remains the production source of truth until the explicit maintenance-window cutover.

The migration must not:

- expose shared catalog writes to unauthenticated clients;
- reactivate disabled Appwrite accounts;
- leave email/password-only users without a sign-in path;
- silently skip, duplicate, or reassign records;
- describe `USE_CONVEX=0` as rollback unless auth and persistence both roll back safely;
- remove or mutate production Appwrite data during the rollback window.

## Current state

The branch already contains useful foundations, but the checked items are not sufficient for production:

- [x] Dev Convex deployment and Better Auth component provisioned
- [x] Places, spots, and tags schema and functions implemented
- [x] Convex persistence adapter and SvelteKit auth proxy implemented
- [x] Read-only Appwrite export and dev import rehearsal implemented
- [x] Appwrite remains present as legacy persistence code
- [x] Unit tests pass and the application build completes
- [ ] `npm run check` passes
- [ ] Convex authorization and migration integration tests pass
- [ ] Production rollback contract is selected and rehearsed
- [ ] Production migration is idempotent and explicitly targeted

The previous rehearsal reported 98 places and 94 spots. Treat those numbers as historical evidence only; production decisions use a fresh export and a new reconciliation report.

## Work sequence and ownership

| Gate | Linear issue | Required before |
| --- | --- | --- |
| Convex access control, validators, tests, and typecheck | [BRO-35](https://linear.app/brookes-personal/issue/BRO-35/harden-convex-functions-and-restore-a-green-validation-gate) | Merge |
| Migrated-user login, recovery, and disabled-account handling | [BRO-36](https://linear.app/brookes-personal/issue/BRO-36/complete-migrated-user-sign-in-and-account-state-handling) | Merge |
| Idempotent import and complete verification | [BRO-37](https://linear.app/brookes-personal/issue/BRO-37/make-the-appwrite-to-convex-import-repeatable-and-verifiable) | Production import |
| Rollback contract chosen and tested | [BRO-38](https://linear.app/brookes-personal/issue/BRO-38/choose-and-test-the-convex-cutover-rollback-contract) | Merge |
| PR rebased/reduced and deployment reproducible | [BRO-39](https://linear.app/brookes-personal/issue/BRO-39/rebase-and-reduce-pr-38-make-deployment-reproducible) | Merge |
| Production import and application cutover | [BRO-40](https://linear.app/brookes-personal/issue/BRO-40/execute-production-convex-import-and-application-cutover) | Go-live |
| Appwrite retirement | [BRO-41](https://linear.app/brookes-personal/issue/BRO-41/retire-appwrite-after-the-rollback-window) | Final cleanup |

## Phase 0 — Make the change safe to merge

### 0.1 Secure and validate Convex functions — BRO-35

- [x] Make `places.upsert` internal or require an authenticated identity. (Removed the unused public mutation; place upserts now occur only inside the authenticated spot-save mutation or internal migrations.)
- [x] Audit every public query and mutation for authentication and ownership. (Catalog reads remain public and read-only; user-scoped spot and tag functions require the caller's matching identity.)
- [ ] Keep `/all-spots` catalog reads public and read-only.
- [x] Add return validators to public Convex functions.
- [ ] Remove avoidable `any` types in the new Convex path.
- [x] Add tests proving unauthenticated writes fail.
- [x] Add tests proving user A cannot read or mutate user B's spots or tags.
- [ ] Make `npm run check`, `npm test`, and `npm run build` pass.

### 0.2 Preserve user access and account state — BRO-36

- [ ] Inventory Appwrite users as Google-linked, email/password-only, or disabled.
- [ ] Skip or preserve disabled users so migration cannot reactivate them.
- [ ] Verify imported Google provider IDs reconnect to the correct Better Auth user and spots.
- [ ] Implement and test a self-service recovery/invitation path for email/password-only users, or approve a documented transition that does not require collecting plaintext passwords.
- [ ] Define duplicate-email and account-linking behavior.
- [ ] Test sign-in, sign-out, session expiry, Google callback, and recovery through the Worker runtime.

Do not tell users to reset their password until a working recovery path has been verified in production-like conditions.

### 0.3 Make migration repeatable — BRO-37

- [ ] Make user, place, spot, and tag imports idempotent.
- [ ] Add a user-plus-normalized-tag index and dedupe rehearsal data.
- [ ] Require an explicit deployment target and an additional production confirmation.
- [ ] Add a dry-run/preflight report before any writes.
- [ ] Report imported, updated, skipped, and failed records with reasons.
- [ ] Reconcile users, places, spots, tags, missing relationships, and per-user spot counts.
- [ ] Retain the source export, summary, user-ID mapping, and verification report through the rollback window.

Never rerun a stale Appwrite export after Convex begins accepting writes; place upserts could overwrite newer Convex catalog data.

### 0.4 Decide rollback semantics — BRO-38

Select and document exactly one option:

#### Option A — reversible provider cutover

Auth and persistence switch together. Retain or restore Appwrite auth behind a provider-level flag, preserve the legacy-to-Convex identity mapping, prevent split writes, and rehearse switching the whole stack back.

#### Option B — one-way auth cutover with application rollback

Remove the misleading runtime rollback claim. Keep Appwrite unchanged and read-only during the rollback window. Rollback means redeploying the pre-cutover application and accepting that Convex-only writes made after cutover require an explicit reconciliation plan.

Record here before merge:

- **Selected option:** TBD
- **Decision owner:** TBD
- **Rollback-window length:** TBD
- **Last safe rollback time:** TBD
- **Exact rollback procedure:** TBD
- **Treatment of writes made after cutover:** TBD

`USE_CONVEX=0` currently switches only persistence; it is **not** a valid rollback by itself.

### 0.5 Reduce and reproduce the PR — BRO-39

- [ ] Rebase PR #38 onto current `main`.
- [ ] Remove patch-equivalent already-merged price work.
- [ ] Move unrelated UI redesign and broad dependency upgrades to separate PRs where practical.
- [ ] Keep one authoritative Appwrite export script under `scripts/`.
- [ ] Track `scripts/put-convex-worker-secrets.mjs` or remove the package command and document its replacement.
- [ ] Reconcile conflicting documentation about Wrangler variables and build-time public Convex URLs.
- [ ] Verify a clean checkout can run check, test, build, and Worker preview.
- [ ] Confirm no credentials, OAuth tokens, migration exports, or user emails are tracked by Git.

## Phase 1 — Development rehearsal

This phase may be repeated only after BRO-37 makes the import idempotent.

### 1.1 Configure development auth

1. Create a development-only Google OAuth client. Do not modify the Appwrite production client.
2. Use redirect URI `http://localhost:5173/api/auth/callback/google`.
3. Set the Convex dev deployment environment:

   ```bash
   npx convex env set BETTER_AUTH_SECRET '<development secret>'
   npx convex env set SITE_URL http://localhost:5173
   npx convex env set GOOGLE_CLIENT_ID '<development client id>'
   npx convex env set GOOGLE_CLIENT_SECRET '<development client secret>'
   ```

### 1.2 Export and rehearse

```bash
npx tsx scripts/export-appwrite.ts
# Use the explicit DEV mode delivered by BRO-37.
npx tsx scripts/rehearse-migration.ts --dev
```

- [ ] Export is read-only and writes only to `.tmp/migration/`.
- [ ] A second identical import makes no destination changes.
- [ ] Disabled users are excluded or remain disabled.
- [ ] Source and destination counts reconcile.
- [ ] Per-user spot ownership reconciles.
- [ ] No orphaned spot-to-place relationships exist.

### 1.3 Application smoke test

```bash
npm run dev:convex
npm run dev
```

Test with at least two distinct users:

- [ ] Google sign-in resumes a migrated account.
- [ ] Email/password transition or recovery works.
- [ ] Disabled account sign-in fails.
- [ ] Logout clears the active session.
- [ ] `/all-spots` works while signed out.
- [ ] `/list` contains only the active user's spots.
- [ ] Direct access to another user's spot returns not found/forbidden.
- [ ] Save, edit, visit-state update, social-link update, and delete work.
- [ ] Tag list/create work without duplicates.

Then test the deployed runtime shape:

```bash
npm run preview:worker
```

- [ ] Repeat auth and data smoke tests through the Worker preview.
- [ ] Execute the rollback rehearsal selected in BRO-38.
- [ ] Record results on BRO-35 through BRO-39.

## Phase 2 — Prepare production

Do not start until all Phase 0 issues are complete.

### 2.1 Create the production Convex deployment

```bash
npx convex deploy
npx convex env set --prod BETTER_AUTH_SECRET '<new production secret>'
npx convex env set --prod SITE_URL https://bite.broox.us
npx convex env set --prod GOOGLE_CLIENT_ID '<production client id>'
npx convex env set --prod GOOGLE_CLIENT_SECRET '<production client secret>'
```

- [ ] Create a production Google OAuth client with redirect URI `https://bite.broox.us/api/auth/callback/google`.
- [ ] Do not rotate or disable the Appwrite OAuth client yet.
- [ ] Put build-time public Convex URLs in gitignored `.env.production.local`.
- [ ] Put runtime secrets/variables in the approved Worker configuration path from BRO-39.
- [ ] Confirm a clean production build contains the intended production Convex URL.
- [ ] Confirm production Convex starts empty or contains only explicitly approved data.

### 2.2 Prepare the maintenance window

- [ ] Name the go/no-go decision owner.
- [ ] Name the rollback operator.
- [ ] Announce the write-freeze window.
- [ ] Record the currently deployed Worker version/commit.
- [ ] Confirm the pre-cutover Worker artifact can be redeployed.
- [ ] Confirm Appwrite backups/export access and Convex dashboard access.
- [ ] Open dashboards for Worker logs, Convex logs, and Sentry.

## Phase 3 — Production import and cutover — BRO-40

### 3.1 Freeze and export

1. Prevent user writes in the production application.
2. Keep production Appwrite unchanged.
3. Produce a fresh read-only export.

```bash
npx tsx scripts/export-appwrite.ts
```

- [ ] Save the timestamped export summary and counts on BRO-40.
- [ ] Verify the export includes users, identities, places, spots, and tags.
- [ ] Verify no OAuth access or refresh tokens were written to disk.

### 3.2 Import explicitly to production

Use only the production-targeted command delivered and tested by BRO-37. Do not rely on whichever deployment happens to be present in `.env.local`.

```bash
# Placeholder; replace with the exact, tested command from BRO-37.
npx tsx scripts/rehearse-migration.ts --prod
```

- [ ] Review the dry-run output before confirming writes.
- [ ] Import users and identities.
- [ ] Import places, spots, and tags.
- [ ] Re-run verification without changing destination state.
- [ ] Reconcile all source/destination and per-user counts.
- [ ] Resolve every skipped or mismatched row before deploying the Worker.

### 3.3 Deploy and verify

```bash
npm run deploy
```

- [ ] Confirm the deployment uses production Convex URLs and the selected provider configuration.
- [ ] Test Google sign-in with a migrated user.
- [ ] Test the approved email/password transition.
- [ ] Test logout and session expiry behavior.
- [ ] Test public `/all-spots` access while signed out.
- [ ] Test list, save, edit, delete, and tags with two users.
- [ ] Confirm cross-user reads and writes fail.
- [ ] Confirm anonymous catalog writes fail.
- [ ] Watch Worker, Convex, and Sentry logs for at least the agreed observation period.

### 3.4 Go/no-go

Choose one and record it on BRO-40:

- **Go:** all checks pass; end the write freeze and start the rollback-window clock.
- **No-go:** execute the exact BRO-38 rollback procedure, keep Appwrite intact, and reconcile any writes made during the attempt.

## Phase 4 — Rollback window

- [ ] Keep Appwrite data, credentials, code, and the pre-cutover artifact available.
- [ ] Do not run `dropLegacyUserIds`.
- [ ] Do not remove Appwrite dependencies or environment variables.
- [ ] Do not rotate the Appwrite Google OAuth credential while rollback depends on it.
- [ ] Monitor authentication failures, user-visible missing data, ownership errors, mutation failures, and count drift.
- [ ] Record incidents and the rollback-window end time on BRO-40.

## Phase 5 — Retire Appwrite — BRO-41

Only begin after the rollback window ends successfully.

- [ ] Confirm production has no Appwrite reads or writes.
- [ ] Preserve the final export and verification evidence according to the retention decision.
- [ ] Remove Appwrite auth and persistence code in a separate cleanup PR.
- [ ] Remove `appwrite` and `node-appwrite` dependencies.
- [ ] Remove obsolete Appwrite environment variables and documentation.
- [ ] Remove the transition flag or make Convex the unconditional composition root.
- [ ] Remove legacy user IDs only after the mapping is no longer needed.
- [ ] Rotate/revoke the previously exposed OAuth credential.
- [ ] Run the full production smoke suite.
- [ ] Close BRO-41 and then BRO-34.

## Evidence template

Attach this information to BRO-40:

```text
Cutover timestamp:
Source Appwrite export timestamp:
Source counts: users / identities / places / spots / tags
Destination counts: users / identities / places / spots / tags
Skipped records and reasons:
Missing relationships:
Per-user ownership reconciliation:
Application commit and Worker version:
Convex production deployment:
Smoke-test operator:
Go/no-go decision owner:
Decision:
Rollback-window end:
Links to logs or screenshots:
```
