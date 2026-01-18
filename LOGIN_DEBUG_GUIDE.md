# Login Issue Debugging Guide

## Possible Causes

Based on the nexus-ai deployment, here are the most likely reasons for login issues:

### 1. Supabase Authentication Not Enabled

**Check in Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Verify **Email** provider is enabled
4. For Google login, verify **Google** provider is configured with your Google Client ID

### 2. Email Confirmations Required

**Check Email Settings:**
1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Check if **"Enable email confirmations"** is turned ON
3. If enabled, users must verify their email before logging in
4. **Temporary Fix**: Disable email confirmations for testing
   - Go to Authentication → Settings
   - Toggle off "Enable email confirmations"
   - This allows immediate login after signup

### 3. Incorrect Redirect URLs

**Check Allowed Redirect URLs:**
1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   ```
   https://nexus-ai-eta-three.vercel.app/chat
   https://nexus-ai-eta-three.vercel.app/auth/callback
   http://localhost:3000/chat
   http://localhost:3000/auth/callback
   ```
3. Add to **Site URL**: `https://nexus-ai-eta-three.vercel.app`

### 4. Database Tables Missing

**Check Required Tables Exist:**
1. In Supabase Dashboard → **Table Editor**
2. Verify these tables exist:
   - `profiles` (for user data)
   - `conversations` (for chat history)
   - `goals` (for goal tracking)

If missing, create them using this SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Row Level Security (RLS) Blocking Access

**Check RLS Policies:**
1. In Supabase Dashboard → **Authentication** → **Policies**
2. Make sure policies allow authenticated users to access their data
3. If too restrictive, temporarily disable RLS for testing:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
   (Re-enable after testing with proper policies)

### 6. API Key Issues

**Verify API Keys:**
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel matches the one in Supabase Dashboard
- Find correct key in Supabase Dashboard → **Settings** → **API** → **Project API keys** → **anon public**

### 7. CORS Issues

**Check CORS Configuration:**
1. In Supabase Dashboard → **Settings** → **API**
2. Verify CORS is not blocking requests from `https://nexus-ai-eta-three.vercel.app`

## Testing Steps

### Test 1: Check Supabase Connection

Open browser console on the login page and run:
```javascript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)
const { data, error } = await supabase.from('profiles').select('count')
console.log('Connection test:', { data, error })
```

### Test 2: Try Creating a Test User

In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Try logging in with those credentials

### Test 3: Check Browser Console

When you try to log in:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in
4. Look for error messages
5. Share any errors you see

### Test 4: Check Network Tab

1. Open DevTools → **Network** tab
2. Try logging in
3. Look for failed requests (red)
4. Click on failed requests to see error details
5. Look specifically for requests to `supabase.co`

## Common Error Messages

### "Invalid login credentials"
- Email/password is incorrect
- User doesn't exist
- Email not confirmed (if confirmations are enabled)

### "Email not confirmed"
- Go to Supabase → Authentication → Users
- Find the user and click "Confirm email"

### "Failed to fetch" or CORS error
- Check CORS settings in Supabase
- Verify URL configuration

### "User already registered"
- Use "Sign In" instead of "Sign Up"
- Or try password reset

## Quick Fixes to Try

1. **Disable Email Confirmations** (easiest):
   - Supabase Dashboard → Authentication → Settings
   - Disable "Enable email confirmations"
   - Try signup again

2. **Manually Confirm Test User**:
   - Supabase Dashboard → Authentication → Users
   - Find your test user
   - Click the three dots → "Confirm email"

3. **Check Site URL**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Set Site URL to: `https://nexus-ai-eta-three.vercel.app`

4. **Test with Google Login**:
   - If Google OAuth is configured, try "Continue with Google"
   - This bypasses email/password issues

## What Information to Provide

If still having issues, please share:
1. **Exact error message** shown on screen or in console
2. **What happens** when you click Sign In (nothing? error? redirect?)
3. **Browser console errors** (F12 → Console tab)
4. **Network errors** (F12 → Network tab, look for red/failed requests)
5. **Whether you're trying to sign up or sign in** (new account or existing?)

## Next Steps

1. Try the quick fixes above
2. Check your Supabase dashboard for the settings mentioned
3. Share any error messages you see
4. Let me know which test revealed issues
