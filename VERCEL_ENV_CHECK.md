# Vercel Environment Variables Check

## ✅ Variables Correctly Configured

All critical environment variables are present in Vercel and match your local `.env.local` file:

| Variable | Local | Vercel | Status |
|----------|-------|--------|--------|
| `ANTHROPIC_API_KEY` | ✅ Set | ✅ Set | ✅ **MATCH** |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ `https://vyadtzhurbvpjuevwghb.supabase.co` | ✅ `https://vyadtzhurbvpjuevwghb.supabase.co` | ✅ **MATCH** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ `sb_publishable_nvJ...` | ✅ `sb_publishable_nvJ...` | ✅ **MATCH** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ `pk_live_51SfL...` | ✅ `pk_live_51SfL...` | ✅ **MATCH** |
| `STRIPE_SECRET_KEY` | ✅ `sk_live_51SfL...` | ✅ `sk_live_51SfL...` | ✅ **MATCH** |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` | ✅ `price_1SqiPx...` | ✅ `price_1SqiPx...` | ✅ **MATCH** |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY` | ✅ `price_1SqiSI...` | ✅ `price_1SqiSI...` | ✅ **MATCH** |

## ⚠️ Issues Found

### 1. TYPO in Vercel Variable Name
**Variable:** `STRIPE_WEBHOOK_SECRE` (line 10 in Vercel env)
**Issue:** Missing the letter 'T' at the end
**Should be:** `STRIPE_WEBHOOK_SECRET`
**Impact:** Your webhook handler in `app/api/chat/stripe/webhook/route.ts` reads `process.env.STRIPE_WEBHOOK_SECRET`, so this typo means the webhook secret is NOT being loaded.

**Fix Required:**
```bash
# Remove the incorrectly named variable
vercel env rm STRIPE_WEBHOOK_SECRE production
vercel env rm STRIPE_WEBHOOK_SECRE preview
vercel env rm STRIPE_WEBHOOK_SECRE development

# Add the correctly named variable
vercel env add STRIPE_WEBHOOK_SECRET production
# Enter value: [YOUR_STRIPE_WEBHOOK_SECRET]

vercel env add STRIPE_WEBHOOK_SECRET preview
# Enter value: [YOUR_STRIPE_WEBHOOK_SECRET]

vercel env add STRIPE_WEBHOOK_SECRET development
# Enter value: [YOUR_STRIPE_WEBHOOK_SECRET]
```

### 2. Missing Variable in Vercel
**Variable:** `NEXT_PUBLIC_APP_URL`
**Status:** Not found in Vercel
**Impact:** Stripe redirects may not work correctly
**Recommended Value:** Your Vercel deployment URL

**To Add:**
```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Enter value: https://nexus-ai-your-domain.vercel.app

vercel env add NEXT_PUBLIC_APP_URL preview
# Enter value: https://nexus-ai-git-preview.vercel.app

vercel env add NEXT_PUBLIC_APP_URL development
# Enter value: http://localhost:3000
```

### 3. Extra Variable in Vercel (Optional)
**Variable:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
**Status:** Present in Vercel, but not in local `.env.local`
**Impact:** No impact if not being used
**Action:** If you're not using Google OAuth, you can safely ignore this. If you are using it, add it to your local `.env.local`.

### 4. Extra Variable in Local (Not Critical)
**Variable:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
**Status:** Present locally, but not in Vercel
**Impact:** This appears to be an old/backup key and is not referenced in your code
**Action:** No action needed unless your code specifically requires it

## Code References Check

Let me verify what environment variables your code actually uses:

### Supabase Client (`lib/supabase.ts`)
```typescript
createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,        // ✅ Set in Vercel
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!    // ✅ Set in Vercel
)
```

### Stripe Webhook (`app/api/chat/stripe/webhook/route.ts`)
```typescript
stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!  // ❌ TYPO in Vercel (STRIPE_WEBHOOK_SECRE)
)

const proMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY  // ✅ Set
const proYearlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY    // ✅ Set
```

### Stripe Checkout (`app/api/chat/stripe/checkout/route.ts`)
```typescript
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,  // ⚠️ NOT set in Vercel
cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,   // ⚠️ NOT set in Vercel
```

## Summary

### Critical Issues:
1. ❌ **Fix webhook secret variable name typo** (STRIPE_WEBHOOK_SECRE → STRIPE_WEBHOOK_SECRET)
2. ⚠️ **Add NEXT_PUBLIC_APP_URL** for Stripe redirects

### All Other Variables:
✅ **All match correctly between local and Vercel**

### Next Steps:
1. Run the commands above to fix the webhook secret variable name
2. Add the NEXT_PUBLIC_APP_URL variable
3. Redeploy on Vercel to pick up the corrected variables

## Quick Fix Commands

```bash
# Fix webhook secret typo
vercel env rm STRIPE_WEBHOOK_SECRE production preview development
vercel env add STRIPE_WEBHOOK_SECRET
# When prompted, add to all environments with your webhook secret from Stripe Dashboard

# Add app URL
vercel env add NEXT_PUBLIC_APP_URL
# Production: https://your-actual-vercel-url.vercel.app
# Preview: https://nexus-ai-git-main.vercel.app (or similar)
# Development: http://localhost:3000

# Redeploy
vercel --prod
```
