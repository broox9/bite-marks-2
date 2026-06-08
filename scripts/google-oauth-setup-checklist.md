# Google OAuth Setup Checklist

This checklist helps you configure Google Sign-In for the Bite Marks app. Use it to verify all configuration steps are complete in both Google Cloud Console and Appwrite Console.

## Prerequisites

- [ ] You have access to the [Google Cloud Console](https://console.cloud.google.com/)
- [ ] You have access to your [Appwrite Console](https://cloud.appwrite.io/)
- [ ] You have the Appwrite Project ID (found in Appwrite Console → Project Settings)

## Part 1: Google Cloud Console Setup

### 1.1 Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Either:
   - Select an existing project from the dropdown, OR
   - Create a new project for this app

### 1.2 Enable Google+ API (if not already enabled)

1. Navigate to **APIs & Services → Library**
2. Search for "Google+ API"
3. Click **Enable**

### 1.3 Configure OAuth Consent Screen

1. Navigate to **APIs & Services → OAuth consent screen**
2. Select **User Type**:
   - **External** (for public apps)
   - **Internal** (for Google Workspace orgs only)
3. Fill in the required fields:
   - **App name**: Bite Marks (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. **Scopes** (optional for basic auth):
   - You can skip adding scopes for now (basic auth only needs email and profile)
6. Click **Save and Continue**
7. **Test users** (if app is in Testing mode):
   - Add the email addresses of users who should be able to sign in
   - This is CRITICAL if your app status is "Testing"
8. Click **Save and Continue**

### 1.4 Publishing Status

**Option A: Keep in Testing Mode** (recommended for development)
- App status: **Testing**
- Only test users can sign in
- No Google review required
- **Action Required**: Add all user emails as test users

**Option B: Publish to Production** (for public launch)
- Click **Publish App** on the OAuth consent screen
- May require Google verification if requesting sensitive scopes
- Anyone with a Google account can sign in

### 1.5 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**
4. Choose **Application type**: **Web application**
5. **Name**: "Bite Marks Web Client" (or your preferred name)
6. **Authorized JavaScript origins** (optional):
   - `http://localhost:5173` (for local development)
   - Your production domain (e.g., `https://bitemarks.app`)
7. **Authorized redirect URIs** (CRITICAL):
   - You need to add the Appwrite OAuth callback URL
   - Format: `https://<appwrite-host>/v1/account/sessions/oauth2/callback/google/<project-id>`
   - Example: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/YOUR_PROJECT_ID`
   - **Where to find this**: 
     - Go to Appwrite Console → Auth → Providers → Google
     - The redirect URI is shown in the provider settings
     - Copy it exactly and paste into Google Cloud Console
8. Click **CREATE**
9. **Save your credentials**:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value
   - You'll need both for Appwrite configuration

## Part 2: Appwrite Console Setup

### 2.1 Enable Google Provider

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Navigate to **Auth → Providers**
4. Find **Google** in the list
5. Click to expand the Google provider settings
6. Toggle **Enable** to ON
7. Enter the credentials from Google Cloud Console:
   - **App ID / Client ID**: Paste the Client ID from Google
   - **App Secret / Client Secret**: Paste the Client Secret from Google
8. **Copy the Redirect URI** shown in this screen
   - You need this for Google Cloud Console (step 1.5.7)
   - Format: `https://<appwrite-host>/v1/account/sessions/oauth2/callback/google/<project-id>`
9. Click **Update** or **Save**

### 2.2 Configure Platforms

1. Navigate to **Project Settings → Platforms** (or similar)
2. Add your app's hostnames:

**For Development:**
- Click **Add Platform**
- Choose **Web**
- **Name**: "Localhost Dev"
- **Hostname**: `localhost` OR `http://localhost:5173`
- **Port**: `5173` (if required separately)

**For Production:**
- Click **Add Platform**
- Choose **Web**
- **Name**: "Production"
- **Hostname**: Your production domain (e.g., `bitemarks.app`)
- Do NOT include protocol (`https://`) if the field is hostname-only
- OR include full URL (e.g., `https://bitemarks.app`) if that's what Appwrite expects

> **Why?** Appwrite uses this to validate OAuth redirect URLs and prevent open redirect attacks.

### 2.3 Verify API Key Permissions

1. Navigate to **Project Settings → API Keys**
2. Find your server API key (the one used in `APPWRITE_API_KEY`)
3. Verify it has the following scopes:
   - `sessions.write` (or equivalent - allows creating sessions)
   - Check Appwrite docs for exact scope names in your version
4. If creating a new API key:
   - Click **Create API Key**
   - Name: "Server API Key"
   - Scopes: Select all necessary server-side scopes
   - Copy the key value and save it securely

### 2.4 Configure Session Length (Optional)

1. Navigate to **Auth → Security**
2. Find **Session Length** or **Session Duration**
3. Set to **7 days** (or your preferred duration)
4. This determines how long users stay logged in

## Part 3: Application Environment Variables

### 3.1 Required Environment Variables

Create or update your `.env` file (or environment configuration):

```bash
# Public variables (safe for client-side)
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1  # Your Appwrite API endpoint
PUBLIC_APP_URL=https://bite.broox.us  # REQUIRED in production for OAuth (your production domain)

# Private variables (server-side only)
APPWRITE_PROJECT_ID=your-project-id-here  # Your Appwrite project ID
APPWRITE_API_KEY=your-api-key-here  # Server API key from Appwrite
```

**⚠️ IMPORTANT FOR PRODUCTION:**

The `PUBLIC_APP_URL` variable is **REQUIRED** in production environments. Without it:
- OAuth redirect URLs will use the request origin, which may not match Appwrite's registered platforms
- This causes the "Invalid redirect" error from Appwrite
- Set it to your exact production domain (e.g., `https://bite.broox.us`)

**For Cloudflare Workers deployment:**

Add `PUBLIC_APP_URL` to your `wrangler.jsonc`:
```jsonc
{
  "vars": {
    "NODE_ENV": "production",
    "PUBLIC_APP_URL": "https://bite.broox.us"
  }
}
```

### 3.2 Variable Checklist

- [ ] `PUBLIC_APPWRITE_ENDPOINT` is set to your Appwrite instance URL
- [ ] `APPWRITE_PROJECT_ID` matches your Appwrite project
- [ ] `APPWRITE_API_KEY` is the server API key with proper scopes
- [ ] `PUBLIC_APP_URL` is set to your production domain (REQUIRED for production)
- [ ] For Cloudflare Workers: `PUBLIC_APP_URL` is in `wrangler.jsonc` vars

## Part 4: Testing

### 4.1 Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Click "Continue with Google"

4. **Expected flow**:
   - Redirects to `/auth/google`
   - Redirects to Google sign-in
   - You sign in with Google
   - Redirects back to `/auth/google/callback` with OAuth tokens
   - Sets session cookie
   - Redirects to `/list` (or home page)

5. **If you see errors**, check the section below

### 4.2 Common Errors and Solutions

See `scripts/test-google-oauth.md` for detailed error troubleshooting.

**Quick reference:**

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| "redirect_uri_mismatch" | Redirect URI not in Google Console | Add Appwrite callback URL to Google Cloud Console |
| "OAuth consent screen not configured" | Missing consent screen setup | Complete Part 1.3 above |
| "Access blocked: This app's request is invalid" | App in Testing mode, user not added | Add user as test user in Google Console |
| Query params show `?oauth=error` | OAuth flow failed at provider | Check Google Cloud Console configuration |
| Query params show `?oauth=invalid` | Invalid OAuth parameters | Check Appwrite configuration and API key permissions |

### 4.3 Verify Success

- [ ] User is redirected through the full OAuth flow
- [ ] User lands on `/list` (or home page) after sign-in
- [ ] Session cookie is set (check browser DevTools → Application → Cookies)
- [ ] User remains logged in after page refresh
- [ ] Logout works correctly (redirects to `/login`)

## Part 5: Production Deployment

### 5.1 Pre-deployment Checklist

- [ ] Production domain added to Appwrite Platforms
- [ ] `PUBLIC_APP_URL` set to production URL (if needed)
- [ ] Production environment variables configured
- [ ] Google OAuth consent screen published (or test users include production users)
- [ ] Google Cloud Console has production domain in Authorized JavaScript origins (if needed)

### 5.2 Post-deployment Testing

- [ ] Test OAuth flow on production URL
- [ ] Verify session persistence
- [ ] Test logout functionality
- [ ] Monitor server logs for errors

## Troubleshooting Resources

- **Code Documentation**: `AUTH-README.md` (project root)
- **OAuth Architecture**: `docs/oauth-social-sign-in.md`
- **Testing Guide**: `scripts/test-google-oauth.md`
- **Appwrite Docs**: [OAuth2 Documentation](https://appwrite.io/docs/products/auth/oauth2)
- **Google Cloud Docs**: [OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849)

## Support

If you encounter issues not covered in this checklist:

1. Check the browser console for client-side errors
2. Check server logs for backend errors
3. Use browser Network tab to trace the OAuth redirect chain
4. Verify all configuration values are correct (Project ID, API keys, etc.)

## Checklist Summary

Use this quick summary to verify all steps are complete:

### Google Cloud Console
- [ ] Project created/selected
- [ ] OAuth consent screen configured
- [ ] Test users added (if in Testing mode) OR app published
- [ ] OAuth 2.0 Client ID created
- [ ] Appwrite redirect URI added to Authorized redirect URIs
- [ ] Client ID and Client Secret saved

### Appwrite Console
- [ ] Google provider enabled
- [ ] Google Client ID and Secret configured
- [ ] Platforms include your app hostnames
- [ ] API key has proper scopes
- [ ] Session length configured

### Application
- [ ] Environment variables set
- [ ] Login page uses `/auth/google` route (fixed in PR #22)
- [ ] OAuth flow tested successfully
- [ ] Session persistence verified

---

**Last updated**: 2026-06-08
**Related Linear Issue**: BRO-5
**Related PR**: #22
