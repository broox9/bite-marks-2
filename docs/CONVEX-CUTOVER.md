# Convex production cutover checklist

Local work is complete against the **dev** Convex deployment (`fastidious-setter-628`).
Do **not** run these steps until you have smoke-tested email login + `/list` locally.

## Already done (local)

- [x] Convex project + schema + places/spots/tags functions
- [x] Better Auth (email/password) on Convex; Google provider wired when env is set
- [x] SvelteKit hooks / layout / login / auth proxy
- [x] `ConvexAdapter` + `USE_CONVEX` flag (`USE_CONVEX=1` in `.env.local`)
- [x] Appwrite export + migration rehearsal → 98 places, 94 spots, users + Google links
- [x] `npm test` (108), `npm run build` green

## You must do (interactive)

### 1. Dev Google OAuth (optional for local Google button)

1. Create a **new** Google OAuth client (do not change the Appwrite prod client).
2. Redirect URI: `http://localhost:5173/api/auth/callback/google`
3. ```bash
   npx convex env set GOOGLE_CLIENT_ID '...'
   npx convex env set GOOGLE_CLIENT_SECRET '...'
   ```

### 2. Local smoke (before prod)

```bash
npm run dev:convex   # terminal 1
npm run dev          # terminal 2
```

- Sign up / sign in with email on `/login`
- Confirm `/list` shows migrated spots for your account
- Save / edit / delete a spot
- `/all-spots`, `/tags`
- `npm run build && npm run preview:worker` and re-test auth through the Worker

### 3. Production Convex

```bash
npx convex deploy
npx convex env set --prod BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set --prod SITE_URL https://bite.broox.us
# prod Google client + GOOGLE_CLIENT_ID/SECRET on --prod
```

Add to `wrangler.jsonc` vars: `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`, `PUBLIC_SITE_URL`, `USE_CONVEX=1`.

### 4. Prod data import

```bash
npx tsx scripts/export-appwrite.ts          # fresh export
# Point CONVEX_DEPLOYMENT at prod (or use --prod with convex run)
npx tsx scripts/rehearse-migration.ts      # or a prod-targeted variant
```

### 5. Deploy Worker + verify

1. `npm run deploy` with `USE_CONVEX=1`
2. Verify Google login + spots on https://bite.broox.us
3. Notify email/password users to reset passwords
4. After a rollback window: remove `src/lib/adapters/secondary/appwrite/**`, drop `appwrite` / `node-appwrite` deps, remove Appwrite env vars
5. Rotate the leaked `client_secret_*.json` credential (update Appwrite console first if still needed mid-transition)
