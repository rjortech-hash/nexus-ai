# Stripe Price ID Setup Guide

## ✅ Code Updated - Now Using Environment Variables

The code has been updated to use environment variables for Stripe price IDs instead of hardcoded values. This is the recommended approach for production deployments.

## 🔑 How to Get Your Stripe Price IDs

### Step 1: Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**
3. Create your "NEXUS AI Pro" product:
   - **Name**: NEXUS AI Pro
   - **Description**: Unlimited conversations with expert AI advisors
   - **Pricing**: Recurring

### Step 2: Create Monthly Price

1. Click **Add pricing**
2. Set up monthly pricing:
   - **Price**: $9.99
   - **Billing period**: Monthly
   - **Currency**: USD
3. Click **Add pricing**
4. **Copy the Price ID** - it looks like: `price_1QkAbcDef123456789`

### Step 3: Create Yearly Price

1. Click **Add another price** on the same product
2. Set up yearly pricing:
   - **Price**: $99
   - **Billing period**: Yearly
   - **Currency**: USD
3. Click **Add pricing**
4. **Copy the Price ID** - it looks like: `price_1QkXyzGhi987654321`

## 📝 Update Environment Variables

### For Local Development

Update your `.env.local` file:

```bash
# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_1QkAbcDef123456789
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_1QkXyzGhi987654321
```

### For Vercel Production

Add these environment variables in Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

```
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY = price_1QkAbcDef123456789
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY = price_1QkXyzGhi987654321
```

Make sure to set the environment to **Production** (or All Environments).

## 🧪 Testing Mode vs Live Mode

### Test Mode (Development)

Use test price IDs from Stripe's test mode:
- Test keys start with `price_test_...`
- Use test credit cards: `4242 4242 4242 4242`
- No real money is charged

### Live Mode (Production)

Use live price IDs from Stripe's live mode:
- Live keys start with `price_live_...` or just `price_...`
- Real credit cards required
- Real money is charged

## 🔄 What Was Changed

### Before (Hardcoded):
```typescript
priceId: "price_1QkxxxxxxxxxxxxxxxxxxxPro"
yearlyPriceId: "price_1QkxxxxxxxxxxxxxxxxxxxProYearly"
```

### After (Environment Variables):
```typescript
priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1QkxxxxxxxxxxxxxxxxxxxPro"
yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || "price_1QkxxxxxxxxxxxxxxxxxxxProYearly"
```

### Benefits:
- ✅ Different price IDs for development/production
- ✅ No need to redeploy when changing prices
- ✅ Keeps sensitive IDs out of git repository
- ✅ Easy to manage across environments

## 📋 Verification Checklist

After setting up Stripe price IDs:

- [ ] Created "NEXUS AI Pro" product in Stripe
- [ ] Created monthly price ($9.99/month)
- [ ] Created yearly price ($99/year)
- [ ] Copied both price IDs
- [ ] Updated `.env.local` for development
- [ ] Added environment variables in Vercel
- [ ] Redeployed to Vercel (if already deployed)
- [ ] Tested checkout flow in test mode
- [ ] Verified webhook receives subscription events

## 🚨 Important Notes

1. **Use Test Mode First**: Always test with test price IDs before going live
2. **Don't Commit Price IDs**: Never commit real price IDs to git
3. **Webhook Configuration**: After deploying, configure webhook at:
   - URL: `https://your-app.vercel.app/api/chat/stripe/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Pricing Docs](https://stripe.com/docs/products-prices/pricing-models)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Next Steps

1. Get your Stripe price IDs (see steps above)
2. Update environment variables locally and in Vercel
3. Test the checkout flow
4. Configure webhooks
5. Deploy to production!

---

**Questions?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for complete deployment instructions.
