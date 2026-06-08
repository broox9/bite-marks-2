# Google OAuth Testing & Diagnostic Guide

This guide helps verify that Google Sign-In is properly configured for the Bite Marks app.

## Quick Fix Applied

**Issue:** The login page was hardcoded to use Appwrite's direct OAuth URL instead of the app's own OAuth flow route.

**Fix:** Updated `/src/routes/login/+page.svelte` to use `/auth/google` which properly handles the OAuth flow through the app's architecture.

## Testing Steps

### 1. Local Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login` (or your dev port)

3. Click "Continue with Google"

4. Observe the flow:
   - Should redirect to `/auth/google`
   - Then to Appwrite's OAuth consent
   - Then to Google's consent screen
   - Then back to `/auth/google/callback?userId=...&secret=...`
   - Finally to `/list` if successful

### 2. Expected Errors (and how to fix them)

#### Error: "OAuth consent screen not configured"
**Cause:** Google Cloud project OAuth consent screen is incomplete or in Testing mode without test users.

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
2. Either:
   - Publish the OAuth consent screen (move from Testing to Production), OR
   - Add your test email addresses under "Test users"

#### Error: "redirect_uri_mismatch"
**Cause:** The Appwrite OAuth callback URL is not registered in Google Cloud Console.

**Fix:**
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/YOUR_PROJECT_ID
   ```
   Replace `YOUR_PROJECT_ID` with your actual Appwrite project ID (found in Appwrite Console)

#### Error: "Invalid OAuth credentials"
**Cause:** Client ID or Client Secret in Appwrite is wrong or expired.

**Fix:**
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Get the correct Client ID and Client Secret
3. Go to Appwrite Console → Auth → Providers → Google
4. Update the credentials

#### Error: "Platform not registered"
**Cause:** The app's hostname is not registered in Appwrite Platforms.

**Fix:**
1. Go to Appwrite Console → Project → Platforms
2. Add your hostnames:
   - For dev: `localhost` or `http://localhost:5173`
   - For production: Your production domain (e.g., `https://yourdomain.com`)

#### Error: OAuth params show as "invalid" or "failed"
**Cause:** The callback route received invalid parameters or session creation failed.

**Fix:**
1. Check server logs for detailed error messages
2. Verify API key permissions (needs `sessions.write` scope)
3. Ensure Appwrite project ID and endpoint are correct in environment variables

## Configuration Checklist

### Google Cloud Console
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID and Client Secret copied to Appwrite
- [ ] Authorized redirect URI includes Appwrite's callback URL
- [ ] OAuth consent screen configured
- [ ] App is either Published OR test users are added (if in Testing mode)

### Appwrite Console
- [ ] Google provider is enabled (Auth → Providers → Google)
- [ ] Client ID and Client Secret are pasted correctly
- [ ] Platforms include your dev and production hostnames
- [ ] API key has sufficient permissions (`sessions.write`)
- [ ] Session length is configured (Auth → Security)

### Environment Variables
- [ ] `PUBLIC_APPWRITE_ENDPOINT` - Your Appwrite API endpoint
- [ ] `APPWRITE_PROJECT_ID` - Your Appwrite project ID
- [ ] `APPWRITE_API_KEY` - Server API key with session permissions
- [ ] `PUBLIC_APP_URL` (optional) - Canonical URL for production

## Debugging Tips

### Check Environment Variables
```bash
# In your terminal where you run npm run dev
echo $PUBLIC_APPWRITE_ENDPOINT
echo $APPWRITE_PROJECT_ID
# Don't echo APPWRITE_API_KEY in production!
```

### Check Network Tab
1. Open browser DevTools → Network tab
2. Click "Continue with Google"
3. Follow the redirect chain:
   - Initial request to `/auth/google`
   - Redirect to Appwrite OAuth URL
   - Redirect to Google consent
   - Redirect back to Appwrite
   - Redirect to `/auth/google/callback` with query params
   - Final redirect to `/list`

### Check Server Logs
Look for errors in your terminal where `npm run dev` is running. Common issues:
- Missing environment variables
- Appwrite API errors
- Session creation failures

### Manual URL Test
You can manually construct the OAuth flow URL to test:
```
http://localhost:5173/auth/google
```

This should redirect you through the full OAuth flow.

## Production Deployment

When deploying to production:

1. **Update Appwrite Platforms**
   - Add your production domain to Platforms

2. **Set PUBLIC_APP_URL** (if using reverse proxy)
   - Set to your canonical production URL
   - Example: `PUBLIC_APP_URL=https://bitemarks.app`

3. **Update Google Cloud Console**
   - Verify the Appwrite redirect URI is still correct
   - Publish the OAuth consent screen (remove Testing mode)

4. **Test the flow** on production before announcing to users

## Security Notes

- Never commit `APPWRITE_API_KEY` to version control
- Use environment variables for all sensitive configuration
- The session cookie is `httpOnly` - JavaScript cannot access it (XSS protection)
- The app uses `sameSite: "lax"` for OAuth compatibility
- Always use HTTPS in production

## References

- [Appwrite OAuth2 Documentation](https://appwrite.io/docs/products/auth/oauth2)
- [Appwrite SSR OAuth2](https://appwrite.io/docs/products/auth/server-side-rendering#oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Project AUTH-README.md](../AUTH-README.md)
- [Project OAuth Documentation](../docs/oauth-social-sign-in.md)
