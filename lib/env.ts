// lib/env.ts - Environment variable validation

const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

  // Anthropic AI
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // App URL for redirects
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const

const optionalEnvVars = {
  STRIPE_PRICE_BASIC: process.env.STRIPE_PRICE_BASIC,
  STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO,
} as const

export function validateEnv() {
  const missing: string[] = []

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please add these to your .env.local file or deployment environment variables.`
    )
  }

  // Warn about optional but recommended variables
  const missingOptional: string[] = []
  for (const [key, value] of Object.entries(optionalEnvVars)) {
    if (!value) {
      missingOptional.push(key)
    }
  }

  if (missingOptional.length > 0 && typeof window === 'undefined') {
    console.warn(
      `Warning: Missing optional environment variables:\n${missingOptional.map(v => `  - ${v}`).join('\n')}`
    )
  }
}

// Auto-validate in development
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error) {
    console.error('\n❌ Environment Configuration Error:\n')
    console.error(error instanceof Error ? error.message : String(error))
    console.error('\n')
  }
}
