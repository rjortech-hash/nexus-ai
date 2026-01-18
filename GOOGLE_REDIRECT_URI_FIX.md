# Fix: Error 400 redirect_uri_mismatch

## The Problem

You're getting `Error 400: redirect_uri_mismatch` when trying to log in with Google. This means the redirect URI that Supabase is sending to Google doesn't match any of the URIs you've registered in Google Cloud Console.

## The Solution

You need to add your **exact Supabase callback URL** to Google Cloud Console.

### Step 1: Get Your Exact Supabase Callback URL

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Click on **Google** (or scroll to Google section)
4. Look for **"Callback URL (for OAuth)"**
5. Copy this URL exactly - it will look like:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```

### Step 2: Add It to Google Cloud Console - IMPORTANT!

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (the one you're using for NEXUS AI)
3. Click on it to edit

**CRITICAL: There are TWO sections - make sure you add to the RIGHT one!**

4. **SKIP the "Authorized JavaScript origins" section** - this is for your app's domain only
   - ❌ DON'T add the Supabase URL here (it will give "Invalid Origin" error)

5. **Scroll down to "Authorized redirect URIs"** - this is where the Supabase callback goes
   - ✅ This section allows paths like `/auth/v1/callback`

6. Click **"+ ADD URI"** in the **"Authorized redirect URIs"** section
7. Paste your Supabase callback URL **EXACTLY** as copied (from Step 1):
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
   - Make sure there's no trailing slash
   - Make sure it's `https://` (not `http://`)
   - Make sure the project ref is correct
   - Use the EXACT URL you copied from Supabase Dashboard

8. Click **"SAVE"** at the bottom

### Step 3: Wait and Test

1. Wait 1-2 minutes for Google to propagate the changes
2. Go back to your app: https://your-app.vercel.app/auth/login
3. Try "Continue with Google" again
4. It should now work!

## Common Mistakes

### ❌ MISTAKE #1: Adding to the wrong section
```
"Authorized JavaScript origins" section:
  https://[project].supabase.co/auth/v1/callback  ← WRONG SECTION!
  ❌ Error: "Invalid Origin: URIs must not contain a path"
```

### ❌ MISTAKE #2: Using your app's URL instead of Supabase
```
"Authorized redirect URIs" section:
  https://your-app.vercel.app/auth/callback  ← This is your app, not Supabase!
  ❌ Error: redirect_uri_mismatch
```

### ✅ CORRECT: Supabase callback URL in redirect URIs section
```
"Authorized redirect URIs" section:
  https://[your-project-ref].supabase.co/auth/v1/callback  ← Perfect!
  ✅ This will work!
```

## Where Each URL Goes

### Section 1: "Authorized JavaScript origins" (NO paths allowed)
Add your **app's domain** here:
```
✅ https://your-app.vercel.app
✅ http://localhost:3000
❌ https://[project].supabase.co/auth/v1/callback  ← NO! Wrong section!
```

### Section 2: "Authorized redirect URIs" (paths ARE allowed)
Add your **Supabase callback** here:
```
✅ https://[your-project-ref].supabase.co/auth/v1/callback
✅ http://localhost:54321/auth/v1/callback
❌ https://your-app.vercel.app  ← This goes in JavaScript origins!
```

## Why This Happens

When you click "Continue with Google":
1. Your app calls Supabase
2. **Supabase** redirects to Google (not your app directly)
3. After you sign in, Google redirects back to **Supabase** (not your app)
4. Supabase processes the login
5. Then Supabase redirects to your app (`/chat`)

That's why Google needs the **Supabase callback URL**, not your app's URL.

## Visual Flow

```
Your App (Vercel)
    ↓ [User clicks "Continue with Google"]
Supabase
    ↓ [Redirects to Google with Supabase callback URL]
Google Sign-In
    ↓ [User signs in]
Supabase Callback ← Google redirects HERE (this must be in Google Cloud Console!)
    ↓ [Supabase processes authentication]
Your App (/chat) ← Supabase redirects here after successful auth
```

## Quick Checklist

After adding the Supabase callback URL to Google Cloud Console, verify:

- [ ] URL copied exactly from Supabase Dashboard
- [ ] URL added to "Authorized redirect URIs" in Google Cloud Console
- [ ] No typos in the URL
- [ ] URL uses `https://` (not `http://`)
- [ ] URL ends with `/auth/v1/callback`
- [ ] Changes saved in Google Cloud Console
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Tested Google login again

## Still Not Working?

If you still get the error after adding the correct URL:

1. **Double-check the URL in Google Cloud Console matches exactly**
   - Go back to Google Cloud Console
   - Look at your redirect URIs
   - Compare character-by-character with the Supabase callback URL

2. **Check if you have multiple OAuth clients**
   - You might have multiple OAuth clients in Google Cloud Console
   - Make sure you're editing the correct one
   - The Client ID should match what you entered in Supabase

3. **Clear browser cache and try again**
   - Sometimes browsers cache the OAuth flow
   - Try in an incognito/private window

4. **Check the full error message**
   - The error page from Google usually shows:
     - What URI was sent (from Supabase)
     - What URIs are registered (from Google Cloud Console)
   - Compare these to find the mismatch

## What to Share If Still Stuck

If it's still not working, share:
1. The **exact callback URL** from your Supabase Dashboard
2. Screenshot of your **Authorized redirect URIs** in Google Cloud Console
3. Any other error details from the Google error page
