# OAuth "Invalid Redirect" Fix (BRO-7)

**Issue**: `AppwriteException: Invalid redirect` on `GET /auth/google` in production  
**Status**: Fixed ✅  
**Pull Request**: TBD  
**Branch**: `cursor/fix-oauth-invalid-redirect-fbda`  
**Sentry Issue**: [BITE-MARKS-2-1Y](https://solobroox.sentry.io/issues/BITE-MARKS-2-1Y)

## Root Cause

The production app at `https://bite.broox.us` was failing OAuth authentication because:

1. **Missing Production Configuration**: `PUBLIC_APP_URL` was not set in `wrangler.jsonc`
2. **Fallback Behavior**: The code fell back to `event.url.origin`, which may not have matched Appwrite's registered platforms
3. **Appwrite Validation**: Appwrite validates OAuth redirect URLs against registered platforms and rejects mismatches

## The Fix

### 1. Added `PUBLIC_APP_URL` to Production Config

**File**: `wrangler.jsonc`

```jsonc
{
  "vars": {
    "NODE_ENV": "production",
    "PUBLIC_APP_URL": "https://bite.broox.us"
  }
}
```

This ensures OAuth redirect URLs (`https://bite.broox.us/auth/google/callback`) match exactly what's registered in Appwrite Console → Project → Platforms.

### 2. Enhanced Error Handling and Logging

**Files**: 
- `src/routes/auth/google/+server.ts`
- `src/routes/auth/google/callback/+server.ts`

Added comprehensive logging to help diagnose future OAuth issues:
- Log redirect URLs being constructed
- Log OAuth callback parameters (without exposing secrets)
- Better error messages pointing to configuration issues
- Graceful fallback with informative errors

### 3. Updated Documentation

**Files Updated**:
- `.env.example` - Clarified that `PUBLIC_APP_URL` is REQUIRED in production
- `AUTH-README.md` - Emphasized production requirements
- `scripts/google-oauth-setup-checklist.md` - Added Cloudflare Workers configuration section

## Why This Fix Works

### The OAuth Flow

1. User clicks "Continue with Google" → navigates to `/auth/google`
2. Server constructs redirect URLs using `getAppBaseUrl(event)`
   - **Success URL**: `https://bite.broox.us/auth/google/callback`
   - **Failure URL**: `https://bite.broox.us/login?oauth=error`
3. Server calls Appwrite's `createOAuth2Token(success, failure)`
4. **Appwrite validates these URLs** against registered platforms
5. If valid, redirects user through Google OAuth
6. Google redirects back to Appwrite
7. Appwrite redirects to success URL with `userId` and `secret`
8. Callback creates session and sets cookie

### The Problem Before

Without `PUBLIC_APP_URL`:
- `getAppBaseUrl()` returned `event.url.origin` from the request
- On Cloudflare Workers, this might be inconsistent or not match registered platforms
- Appwrite rejected the redirect URLs → "Invalid redirect" error

### The Solution

With `PUBLIC_APP_URL="https://bite.broox.us"`:
- `getAppBaseUrl()` consistently returns the canonical production domain
- Redirect URLs always match: `https://bite.broox.us/auth/google/callback`
- This URL must be registered in Appwrite Console → Project → Platforms
- Appwrite accepts the redirect → OAuth flow succeeds

## Configuration Requirements

### Appwrite Console

Navigate to **Project → Platforms** and ensure you have a platform registered:

- **Type**: Web
- **Name**: Production (or any name)
- **Hostname**: `bite.broox.us` OR `https://bite.broox.us` (check Appwrite's format)

The OAuth redirect URLs (`https://bite.broox.us/auth/google/callback`) must match a registered platform.

### Environment Variables

**Production (Cloudflare Workers)** - `wrangler.jsonc`:
```jsonc
{
  "vars": {
    "NODE_ENV": "production",
    "PUBLIC_APP_URL": "https://bite.broox.us",
    "PUBLIC_APPWRITE_ENDPOINT": "https://cloud.appwrite.io/v1",
    "APPWRITE_PROJECT_ID": "your-project-id"
  }
}
```

**Secrets** (set via `wrangler secret put`):
```bash
wrangler secret put APPWRITE_API_KEY
# Paste your Appwrite server API key
```

**Local Development** - `.env`:
```bash
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
# PUBLIC_APP_URL is optional for local dev (defaults to http://localhost:5173)
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

## Deployment Steps

### 1. Deploy the Fix

```bash
# Build the app
npm run build

# Deploy to Cloudflare Workers
npx wrangler deploy
```

### 2. Verify Appwrite Configuration

In Appwrite Console:

1. **Project → Platforms**:
   - Ensure `bite.broox.us` (or `https://bite.broox.us`) is registered
   
2. **Auth → Providers → Google**:
   - Provider is enabled
   - Client ID and Secret are configured
   
3. **Project Settings → API Keys**:
   - Your server API key has `sessions.write` scope

### 3. Test the Fix

1. Navigate to `https://bite.broox.us/login`
2. Click "Continue with Google"
3. Should redirect to Google sign-in
4. After signing in with Google, should redirect back to app
5. Should land on `/list` with session cookie set

### 4. Monitor Logs

Check Cloudflare Workers logs for the new OAuth logging:

```
[OAuth] Initiating Google OAuth flow { base: 'https://bite.broox.us', ... }
[OAuth] Redirecting to: https://cloud.appwrite.io/...
[OAuth Callback] Received OAuth callback { hasUserId: true, hasSecret: true, ... }
[OAuth Callback] Session created successfully
[OAuth Callback] Session cookie set, redirecting to /list
```

## Testing Locally

To test locally with the changes:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Navigate to http://localhost:5173/login
# Click "Continue with Google"
# Should work if Appwrite is configured correctly
```

**Note**: For local testing, ensure `localhost` is registered in Appwrite Console → Project → Platforms.

## Common Errors (Even After Fix)

| Error | Cause | Solution |
|-------|-------|----------|
| Still getting "Invalid redirect" | Platform not registered in Appwrite | Add `bite.broox.us` to Appwrite Console → Project → Platforms |
| "redirect_uri_mismatch" from Google | Google OAuth config issue | Add Appwrite's redirect URI to Google Cloud Console |
| "Access blocked" from Google | App in Testing mode | Add user as test user in Google Cloud Console OR publish app |
| `?oauth=invalid` in callback | Invalid OAuth params from Appwrite | Check Appwrite logs, verify API key permissions |

## Verification Checklist

After deploying:

- [ ] `PUBLIC_APP_URL` is set in `wrangler.jsonc` to `https://bite.broox.us`
- [ ] `bite.broox.us` is registered in Appwrite Console → Project → Platforms
- [ ] Google provider is enabled in Appwrite with valid credentials
- [ ] Can navigate to `https://bite.broox.us/login`
- [ ] "Continue with Google" button redirects properly
- [ ] OAuth flow completes successfully
- [ ] User lands on `/list` after signing in
- [ ] Session persists across page refreshes
- [ ] No "Invalid redirect" errors in Sentry

## Files Changed

1. **`wrangler.jsonc`** - Added `PUBLIC_APP_URL` to vars
2. **`src/routes/auth/google/+server.ts`** - Added error handling and logging
3. **`src/routes/auth/google/callback/+server.ts`** - Added detailed logging
4. **`.env.example`** - Clarified production requirements
5. **`AUTH-README.md`** - Emphasized `PUBLIC_APP_URL` requirement
6. **`scripts/google-oauth-setup-checklist.md`** - Added Cloudflare Workers section
7. **`OAUTH_REDIRECT_FIX.md`** (this file) - Comprehensive fix documentation

## Related Issues

- **Linear Issue**: BRO-7
- **Sentry Issue**: [BITE-MARKS-2-1Y](https://solobroox.sentry.io/issues/BITE-MARKS-2-1Y)
- **Previous OAuth Fix**: BRO-5 (PR #22) - Fixed login page to use correct route
- **Commit Message to Auto-Close Sentry**: `Fixes BITE-MARKS-2-1Y`

## References

- [Appwrite SSR OAuth2 Documentation](https://appwrite.io/docs/products/auth/server-side-rendering#oauth2)
- [Appwrite Platform Configuration](https://appwrite.io/docs/products/auth/security#platform-configuration)
- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- Project: `AUTH-README.md`, `docs/oauth-social-sign-in.md`

---

**Created**: 2026-06-08  
**Author**: Cursor Agent  
**Status**: Ready for deployment ✅
