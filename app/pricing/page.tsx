'use client'

import { useState, useEffect } from 'react'
import { Brain, Check, Zap, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  {
    name: 'Free',
    price: '$0',
    priceId: null,
    icon: Sparkles,
    features: [
      '10 conversations/month',
      '3 basic expert avatars',
      'Text-only interactions',
      'Community access',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$39',
    priceId: 'price_1234567890', // Replace with your Stripe Price ID
    icon: Zap,
    features: [
      'Unlimited conversations',
      '50+ expert avatars',
      'Voice + video interactions',
      'Private knowledge vault (5GB)',
      'Multi-expert councils (3 experts)',
      'Proactive wisdom nudges',
      'Goal tracking with ML',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Elite',
    price: '$99',
    priceId: 'price_0987654321', // Replace with your Stripe Price ID
    icon: Crown,
    features: [
      'Everything in Pro',
      'Custom avatar creation',
      'Legacy conversations',
      'Multi-expert councils (7 experts)',
      'Unlimited vault storage',
      'White-glove onboarding',
      'API access',
      'Early feature access',
    ],
    cta: 'Go Elite',
    popular: false,
  },
]

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      // Free plan - redirect to signup
      router.push('/auth/login')
      return
    }

    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(planName)

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold gradient-text">NEXUS</span>
          </Link>
          <Link href="/chat">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              {user ? 'Dashboard' : 'Sign In'}
            </button>
          </Link>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your <span className="gradient-text">Transformation</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start free, upgrade anytime. Cancel whenever you want.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.name}
                  className={`relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8 rounded-2xl border-2 transition-all hover:scale-105 ${
                    plan.popular
                      ? 'border-purple-500 shadow-xl shadow-purple-500/20'
                      : 'border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <Icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold gradient-text">
                        {plan.price}
                      </span>
                      {plan.price !== '$0' && (
                        <span className="text-gray-400">/month</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.priceId, plan.name)}
                    disabled={loading === plan.name}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.name ? 'Processing...' : plan.cta}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-12 text-gray-400 text-sm">
            <p>All plans include 7-day free trial. No credit card required for Free plan.</p>
            <p className="mt-2">
              Questions? <a href="mailto:support@nexus.ai" className="text-purple-400 hover:underline">Contact us</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 NEXUS AI. Secure payments powered by Stripe.</p>
        </div>
      </footer>
    </div>
  )
}