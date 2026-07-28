# OAuth / social sign-in (Better Auth + Convex)

Google sign-in is handled by **Better Auth** running on Convex, proxied through
`/api/auth/*` on this SvelteKit app.

## Flow

1. User clicks **Continue with Google** on `/login`.
2. `authClient.signIn.social({ provider: "google", callbackURL: "/list" })` starts the OAuth flow.
3. Browser is redirected to Google, then back to
   `{SITE_URL}/api/auth/callback/google` (proxied to `{PUBLIC_CONVEX_SITE_URL}/api/auth/callback/google`).
4. Better Auth sets the session/JWT cookie; the app redirects to `/list`.

## Google Cloud Console

Create **separate** OAuth clients for dev and prod:

| Environment | Redirect URI |
|-------------|--------------|
| Dev | `http://localhost:5173/api/auth/callback/google` |
| Prod | `https://bite.broox.us/api/auth/callback/google` |

Set credentials on the matching Convex deployment (not in `.env` for the Worker):

```bash
npx convex env set GOOGLE_CLIENT_ID '...'
npx convex env set GOOGLE_CLIENT_SECRET '...'
```

## Related

- Auth overview: [AUTH-README.md](./AUTH-README.md)
- Convex Better Auth SvelteKit guide: https://labs.convex.dev/better-auth/framework-guides/sveltekit
