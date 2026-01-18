# Google OAuth Login Fix Guide

## Current Implementation

Your nexus-ai app uses Supabase's Google OAuth provider. The code in `app/auth/login/page.tsx` is:

```typescript
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/chat`,
    },
  })
  if (error) setError(error.message)
}
```

## Common Issues and Fixes

### 1. Google Provider Not Enabled in Supabase

**Fix:**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**
5. You'll need to provide:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### 2. Missing Google OAuth Credentials

You need to create OAuth credentials in Google Cloud Console:

**Step-by-Step:**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select a Project**
   - If you don't have a project, create one
   - Name it something like "NEXUS AI"

3. **Enable Google+ API**
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. **Create OAuth Consent Screen**
   - Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** user type
   - Fill in:
     - App name: `NEXUS AI`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes:
     - `userinfo.email`
     - `userinfo.profile`
   - Save and continue

5. **Create OAuth Client ID**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `NEXUS AI Web Client`
   - **Authorized JavaScript origins**:
     ```
     https://your-app.vercel.app
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     http://localhost:54321/auth/v1/callback
     ```

     To find your Supabase callback URL:
     - Go to Supabase Dashboard → Authentication → Providers → Google
     - Copy the **Callback URL (for OAuth)** shown there
     - It should look like: `https://your-project-ref.supabase.co/auth/v1/callback`

6. **Copy Credentials**
   - After creating, you'll see:
     - **Client ID** (starts with numbers, ends in `.apps.googleusercontent.com`)
     - **Client Secret** (random string)
   - Keep these handy

### 3. Configure Google Provider in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Google**
3. Toggle **Enable Sign in with Google** to ON
4. Paste your **Client ID** (from Google Cloud Console)
5. Paste your **Client Secret** (from Google Cloud Console)
6. Click **Save**

### 4. Add Redirect URLs in Supabase

1. Still in Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   https://your-app.vercel.app/chat
   https://your-app.vercel.app/auth/callback
   http://localhost:3000/chat
   http://localhost:3000/auth/callback
   ```
3. Set **Site URL** to: `https://your-app.vercel.app`

### 5. Optional: Add Google Client ID to Environment (Not Required)

The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` variable you have is not actually used by Supabase Auth. Supabase handles Google OAuth server-side using the credentials you configure in the dashboard.

You can safely ignore or remove this environment variable unless you're using it elsewhere.

## Testing Steps

### Test 1: Check Supabase Google Provider Status

1. Go to Supabase Dashboard → Authentication → Providers
2. Verify Google shows as **Enabled** (green toggle)
3. Verify Client ID and Secret are filled in

### Test 2: Check Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client
3. Verify redirect URIs include your Supabase callback URL
4. Verify JavaScript origins include your Vercel domain

### Test 3: Try Google Login

1. Go to https://your-app.vercel.app/auth/login
2. Click "Continue with Google"
3. You should be redirected to Google sign-in
4. After signing in, you should be redirected back to `/chat`

### What Should Happen:

1. Click "Continue with Google"
2. Browser redirects to `https://accounts.google.com/...`
3. You select your Google account
4. Google redirects to `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
5. Supabase processes the OAuth callback
6. Supabase redirects to `https://your-app.vercel.app/chat`
7. You're logged in!

## Common Errors

### "Error: Invalid redirect_uri"
- **Cause**: Redirect URI not added to Google Cloud Console
- **Fix**: Add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` to Google OAuth client

### "Error: Access blocked: This app's request is invalid"
- **Cause**: OAuth consent screen not configured
- **Fix**: Complete OAuth consent screen setup in Google Cloud Console

### "Error: The OAuth client was not found"
- **Cause**: Wrong Client ID in Supabase
- **Fix**: Double-check Client ID matches exactly (including `.apps.googleusercontent.com`)

### "Error: Provider not enabled"
- **Cause**: Google provider disabled in Supabase
- **Fix**: Enable it in Supabase Dashboard → Authentication → Providers

### Button does nothing / No error shown
- **Cause**: JavaScript error or popup blocked
- **Fix**:
  - Open browser console (F12) to see errors
  - Check if popup blocker is preventing Google sign-in window
  - Try allowing popups for your site

## Checklist

Use this checklist to ensure everything is configured:

- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created (Web application)
- [ ] Authorized JavaScript origins include Vercel domain
- [ ] Authorized redirect URIs include Supabase callback URL
- [ ] Client ID and Secret copied from Google Cloud Console
- [ ] Google provider enabled in Supabase Dashboard
- [ ] Client ID pasted into Supabase Google provider settings
- [ ] Client Secret pasted into Supabase Google provider settings
- [ ] Redirect URLs configured in Supabase URL Configuration
- [ ] Site URL set in Supabase URL Configuration
- [ ] Tested Google login flow

## Quick Debug

If Google login still doesn't work, check browser console (F12) when you click the button:

1. Open DevTools (F12)
2. Go to **Console** tab
3. Click "Continue with Google"
4. Look for error messages
5. Common errors:
   - `Provider google is disabled` → Enable in Supabase
   - `Invalid redirect_uri` → Fix in Google Cloud Console
   - `Network error` → Check CORS/firewall

## Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## What I Can't Check

Since I can't access your Supabase or Google Cloud Console dashboards, you'll need to manually verify:

1. Google provider is enabled in Supabase
2. Client ID and Secret are correctly entered in Supabase
3. OAuth client exists in Google Cloud Console
4. Redirect URIs match exactly

**Most Common Issue**: The Supabase callback URL not added to Google Cloud Console's authorized redirect URIs.
