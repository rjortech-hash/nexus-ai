export const PLANS = {
  FREE: {
    name: "Free",
    priceId: null,
    price: "$0",
    yearlyPrice: "$0",
    dailyLimit: 10,
    features: [
      "10 conversations per day",
      "Access to 5 expert advisors",
      "Basic AI responses",
      "Community support",
      "Standard response time",
      "Email support"
    ]
  },
  PRO: {
    name: "Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_PRO || "price_1QkxxxxxxxxxxxxxxxxxxxPro",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || "price_1QkxxxxxxxxxxxxxxxxxxxProYearly",
    price: "$9.99",
    yearlyPrice: "$99",
    dailyLimit: null, // unlimited
    features: [
      "Unlimited conversations",
      "Access to all expert advisors",
      "Advanced AI reasoning",
      "Multi-expert councils",
      "Priority response time",
      "Context memory (30 days)",
      "Export conversations",
      "Priority support",
      "No ads",
      "Early access to new features"
    ]
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: null,
    price: "Custom",
    yearlyPrice: "Custom",
    dailyLimit: null, // unlimited
    features: [
      "Everything in Pro",
      "Custom AI models",
      "Team collaboration",
      "Admin dashboard",
      "SSO & SAML",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Custom training",
      "API access",
      "Volume discounts",
      "White-label options"
    ]
  }
}

export type PlanType = keyof typeof PLANS
