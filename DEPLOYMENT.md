# NEXUS AI - Deployment Guide

## ✅ Pre-Deployment Checklist

Your application is now ready for deployment! Here's what has been fixed and configured:

### Fixed Issues

1. ✅ **TypeScript Type Errors** - Fixed all Supabase database type mismatches
2. ✅ **Environment Variables** - Added validation and created `.env.example`
3. ✅ **Hardcoded Values** - Replaced hardcoded email with actual user authentication
4. ✅ **Missing Functions** - Fixed `createSupabaseClient` to `createBrowserSupabase`
5. ✅ **Build Process** - Verified production build completes successfully
6. ✅ **Vercel Configuration** - Added `vercel.json` for deployment settings

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option since your project is already configured and linked.

#### Steps:

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Set up environment variables in Vercel**
   - Go to https://vercel.com/dashboard
   - Select your `nexus-ai` project
   - Navigate to **Settings** → **Environment Variables**
   - Add the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vyadtzhurbvpjuevwghb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   STRIPE_PRICE_BASIC=price_xxxxx
   STRIPE_PRICE_PRO=price_xxxxx
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

3. **Important: Update NEXT_PUBLIC_APP_URL**
   - After your first deployment, Vercel will give you a URL (e.g., `https://nexus-ai-xyz.vercel.app`)
   - Update the `NEXT_PUBLIC_APP_URL` environment variable with this URL
   - Redeploy to apply the change

4. **Configure Stripe Webhook**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/chat/stripe/webhook`
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

5. **Configure Supabase OAuth Redirects**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add redirect URL: `https://your-domain.vercel.app/auth/callback`
   - Add site URL: `https://your-domain.vercel.app`

6. **Deploy**
   ```bash
   vercel --prod
   ```
   Or push to main branch if auto-deployment is enabled.

---

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and initialize**
   ```bash
   netlify login
   netlify init
   ```

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: (leave empty)

4. **Set environment variables**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-value"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-value"
   netlify env:set ANTHROPIC_API_KEY "your-value"
   netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "your-value"
   netlify env:set STRIPE_SECRET_KEY "your-value"
   netlify env:set STRIPE_WEBHOOK_SECRET "your-value"
   netlify env:set STRIPE_PRICE_BASIC "your-value"
   netlify env:set STRIPE_PRICE_PRO "your-value"
   netlify env:set NEXT_PUBLIC_APP_URL "your-netlify-url"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

6. **Follow the same Stripe and Supabase configuration steps as Vercel**

---

## ⚠️ CRITICAL: Security Reminders

### 1. Remove Sensitive Data from Git

Your `.env.local` file contains **live API keys** that should NOT be in version control:

```bash
# Remove from tracking
git rm --cached .env.local

# Add to .gitignore (already done)
echo ".env.local" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove .env.local from tracking"
```

### 2. Rotate Exposed Keys

If your repository is public or has been shared, **rotate these keys immediately**:

- Anthropic API Key (sk-ant-api03-...)
- Stripe Secret Key (sk_live_...)
- Stripe Webhook Secret (whsec_...)
- Supabase Service Role Key (if exposed)

### 3. Update Stripe Price IDs

Replace placeholder price IDs in your environment variables:
- `STRIPE_PRICE_BASIC` is currently `price_123` (placeholder)
- `STRIPE_PRICE_PRO` is currently `price_456` (placeholder)

Get the real price IDs from your Stripe Dashboard → Products.

---

## 📋 Post-Deployment Verification

After deployment, test these critical flows:

1. **Authentication**
   - [ ] Email/password signup
   - [ ] Email/password login
   - [ ] Google OAuth (if configured)
   - [ ] Logout

2. **Chat Functionality**
   - [ ] Select an expert
   - [ ] Send a message
   - [ ] Receive AI response
   - [ ] Save conversation
   - [ ] Load previous conversation

3. **Subscription Flow**
   - [ ] View pricing page
   - [ ] Click subscribe (test mode)
   - [ ] Complete Stripe checkout
   - [ ] Verify webhook updates subscription tier
   - [ ] Access customer portal

4. **Goals Feature**
   - [ ] Create a new goal
   - [ ] Update progress
   - [ ] Complete a goal
   - [ ] Delete a goal

---

## 🔧 Configuration Files

### `.env.example`
Template for environment variables - share this with team members (created ✅)

### `vercel.json`
Vercel-specific configuration (created ✅)

### `lib/env.ts`
Environment variable validation - runs automatically in development (created ✅)

---

## 📊 Monitoring & Analytics

Your app includes:
- **@vercel/speed-insights** - Already integrated for performance monitoring
- **Supabase Analytics** - Track user events via `usage_analytics` table

---

## 🐛 Common Issues

### Issue: "Missing required environment variables"
**Solution**: Ensure all variables from `.env.example` are set in your deployment platform

### Issue: Stripe webhook not working
**Solution**:
1. Verify the webhook URL is correct
2. Check webhook signing secret matches
3. Ensure events are selected: `customer.subscription.*`

### Issue: Supabase authentication fails
**Solution**:
1. Check redirect URLs in Supabase dashboard
2. Verify `NEXT_PUBLIC_APP_URL` is set correctly
3. Ensure anon key is public-safe

### Issue: Build fails on deployment
**Solution**: Run `npm run build` locally first to catch errors

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

## ✨ Your Deployment is Ready!

All code changes have been made and the build passes successfully. Follow the steps above to deploy to production.

**Good luck with your launch! 🚀**
