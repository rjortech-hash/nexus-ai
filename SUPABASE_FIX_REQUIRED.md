# ❌ CRITICAL: Supabase Configuration Error

## Problem Detected

Your `.env.local` file has an **incorrect Supabase URL** that will prevent the application from working.

### Current Configuration (WRONG)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/org/wundwopdzamvvbqalsqu
```

This is your **dashboard URL**, not your **project API URL**. The app cannot connect to Supabase with this.

## How to Fix

### Step 1: Get Your Correct Supabase Project URL

1. Go to https://supabase.com/dashboard/org/wundwopdzamvvbqalsqu
2. Click on your **nexus-ai** project (or whichever project you're using)
3. Click on **Settings** (gear icon in sidebar)
4. Click on **API** section
5. Look for **Project URL** - it should look like:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   (where xxxxxxxxxxxxx is your project reference ID)

### Step 2: Get Your Anon Key

While you're in the API settings:
1. Look for **Project API keys**
2. Copy the **anon** / **public** key (starts with `eyJ` or `sb_publishable_`)

### Step 3: Update .env.local

Replace line 5-6 in your `.env.local` file:

**BEFORE (Current - WRONG):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/org/wundwopdzamvvbqalsqu
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_nvJETqe31Bgn4pfkgxYQaQ_wvWsowCZ
```

**AFTER (Correct format):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-FROM-DASHBOARD
```

### Step 4: Also Update Netlify

After fixing `.env.local`, you MUST also update these same values in Netlify:
1. Go to Netlify dashboard → Your site → Site settings
2. Build & deploy → Environment → Environment variables
3. Update both:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Trigger a new deployment

## Previous Working Configuration

Based on git history, your project was previously using:
```
NEXT_PUBLIC_SUPABASE_URL=https://vyadtzhurbvpjuevwghb.supabase.co
```

**Verify if this is still your correct project URL**, or if you've created a new Supabase project.

## Quick Verification

After updating, verify the URL format is correct:
- ✅ Correct: `https://vyadtzhurbvpjuevwghb.supabase.co`
- ❌ Wrong: `https://supabase.com/dashboard/org/wundwopdzamvvbqalsqu`
- ❌ Wrong: `https://app.supabase.com/...`

The URL should:
- Start with `https://`
- Contain a project reference (random letters/numbers)
- End with `.supabase.co`
- NOT contain `/dashboard/` or `/org/`

## Impact of Current Error

With the current wrong URL:
- ❌ App cannot connect to database
- ❌ User authentication will fail
- ❌ All Supabase queries will fail
- ❌ Build may fail on Netlify
- ❌ Users cannot sign in or use any features

This MUST be fixed before deployment.
