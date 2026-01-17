"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PLANS } from "@/lib/plans"
import { createBrowserSupabase } from "@/lib/supabase"
import { Brain, Check, Star, Crown, Zap, Sparkles } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    const getUser = async () => {
      const supabase = createBrowserSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])

  const subscribe = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      if (planName === "Free") {
        window.location.href = "/chat"
      } else {
        window.location.href = "/contact"
      }
      return
    }

    setLoading(priceId)

    const res = await fetch("/api/chat/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: billingPeriod === "yearly" && "yearlyPriceId" in PLANS.PRO ? PLANS.PRO.yearlyPriceId : priceId,
        customerEmail: userEmail,
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(null)
    }
  }

  const planIcons: Record<string, any> = {
    Free: Sparkles,
    Pro: Crown,
    Enterprise: Zap,
  }

  const planGradients: Record<string, string> = {
    Free: "from-purple-600 to-blue-600",
    Pro: "from-purple-600 to-pink-600",
    Enterprise: "from-pink-600 to-red-600",
  }

  const faqs = [
    {
      question: "Can I switch plans anytime?",
      answer: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the start of your next billing cycle."
    },
    {
      question: "What happens when I hit the free tier limit?",
      answer: "You'll see a friendly prompt to upgrade to Pro for unlimited conversations. Your conversation history is always saved."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 7-day money-back guarantee for Pro subscriptions. No questions asked."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards via Stripe. Enterprise customers can also pay via invoice."
    },
    {
      question: "Is there a student discount?",
      answer: "Yes! Students get 50% off Pro plans. Contact support with your student ID for a discount code."
    },
    {
      question: "How does context memory work?",
      answer: "Pro users get 30 days of context memory, meaning your AI advisors remember your previous conversations and provide more personalized advice."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold gradient-text">NEXUS</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/chat">
              <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                Dashboard
              </button>
            </Link>
            <Link href="/chat">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Choose Your <span className="gradient-text">Advisory Plan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Start free, upgrade when you need unlimited expert guidance
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-purple-900/30 p-2 rounded-full border border-purple-500/30">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingPeriod === "yearly"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {Object.entries(PLANS).map(([key, plan], index) => {
              const Icon = planIcons[plan.name]
              const gradient = planGradients[plan.name]
              const isPopular = plan.name === "Pro"
              const displayPrice = billingPeriod === "yearly" ? plan.yearlyPrice : plan.price
              const priceId = billingPeriod === "yearly" && "yearlyPriceId" in plan ? (plan as any).yearlyPriceId : plan.priceId

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`relative bg-gradient-to-br ${
                    isPopular
                      ? "from-purple-900/50 to-pink-900/50 border-purple-500/50"
                      : "from-purple-900/20 to-blue-900/20 border-purple-500/20"
                  } p-8 rounded-2xl border backdrop-blur-sm ${isPopular ? "card-glow" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-2 mb-4">
                      <span className="text-5xl font-bold gradient-text">{displayPrice}</span>
                      {displayPrice !== "Custom" && displayPrice !== "$0" && (
                        <span className="text-gray-400">
                          /{billingPeriod === "yearly" ? "year" : "month"}
                        </span>
                      )}
                    </div>
                    {billingPeriod === "yearly" && plan.price !== "$0" && plan.price !== "Custom" && (
                      <p className="text-sm text-green-400">
                        Save ${((parseFloat(plan.price.replace("$", "")) * 12) - parseFloat(plan.yearlyPrice.replace("$", ""))).toFixed(0)} per year
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => subscribe(priceId, plan.name)}
                    disabled={loading === priceId}
                    className={`w-full py-4 rounded-full font-semibold transition-all ${
                      isPopular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105"
                        : "border-2 border-purple-500 hover:bg-purple-500/10"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === priceId ? "Redirecting..." : plan.name === "Free" ? "Start Free" : plan.name === "Enterprise" ? "Contact Sales" : "Go Pro"}
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Trusted by 200K+ professionals worldwide</span>
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} faq={faq} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 NEXUS AI. Built with Claude by Anthropic.</p>
        </div>
      </footer>
    </div>
  )
}

function FAQItem({ faq }: { faq: { question: string, answer: string } }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={false}
      className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/20 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-purple-500/10 transition-colors"
      >
        <span className="font-semibold">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-4 text-gray-400">
          {faq.answer}
        </div>
      </motion.div>
    </motion.div>
  )
}
