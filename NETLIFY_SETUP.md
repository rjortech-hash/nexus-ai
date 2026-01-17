# Netlify Deployment Setup

## Environment Variables Required

To fix the build error, add these environment variables to your Netlify site:

### Step 1: Access Netlify Dashboard
1. Go to https://app.netlify.com
2. Select your nexus-ai site
3. Navigate to **Site settings** → **Build & deploy** → **Environment**
4. Click **Environment variables**

### Step 2: Add Required Variables

Add each of these variables by clicking "Add a variable":

```bash
# Supabase Configuration (CRITICAL - These fix the build error)
# Copy these exact values from your .env.local file
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url-from-env-local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key-from-env-local>

# Anthropic API
# Copy from .env.local
ANTHROPIC_API_KEY=<your-anthropic-api-key-from-env-local>

# Stripe Configuration
# Copy these exact values from your .env.local file
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key-from-env-local>
STRIPE_SECRET_KEY=<your-stripe-secret-key-from-env-local>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret-from-env-local>
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=<your-pro-monthly-price-id-from-env-local>
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=<your-pro-yearly-price-id-from-env-local>

# App URL (Update this with your actual Netlify URL after first deployment)
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
```

**IMPORTANT**: You must copy all values from your local `.env.local` file. Do not use these placeholder values.

### Step 3: Deploy with Environment Variables

After adding all variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Monitor the build logs for success

## Post-Deployment Configuration

### 1. Update App URL
After your first successful deployment:
1. Copy your Netlify URL (e.g., `https://nexus-ai-123456.netlify.app`)
2. Update the `NEXT_PUBLIC_APP_URL` environment variable with this URL
3. Redeploy

### 2. Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-netlify-url.netlify.app/api/chat/stripe/webhook`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Netlify environment variables if different

### 3. Test the Deployment
1. Visit your Netlify URL
2. Test authentication flow
3. Test Stripe checkout
4. Verify Supabase connection

## Troubleshooting

### Build Still Fails
- Verify all environment variables are correctly copied (no extra spaces)
- Ensure variable names match exactly (case-sensitive)
- Clear cache and redeploy

### Stripe Issues
- Verify you're using **live** keys (not test keys) in production
- Check webhook endpoint is accessible
- Verify price IDs match your Stripe dashboard

### Supabase Connection Issues
- Verify the Supabase URL and anon key are correct
- Check Supabase project is not paused
- Verify RLS policies allow access

## Security Notes

- **Never commit `.env.local` to Git** - It contains secret keys
- Use Netlify's environment variables for all sensitive data
- The `NEXT_PUBLIC_` prefix makes variables visible to the browser (safe for public keys only)
- Keep `STRIPE_SECRET_KEY` and `ANTHROPIC_API_KEY` without `NEXT_PUBLIC_` prefix (server-side only)
