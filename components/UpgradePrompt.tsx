"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Crown, X, Zap, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface UpgradePromptProps {
  reason: "limit_reached" | "feature_locked" | "gentle_nudge"
  currentUsage?: number
  limit?: number
  onClose?: () => void
}

export function UpgradePrompt({ reason, currentUsage, limit, onClose }: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const getContent = () => {
    switch (reason) {
      case "limit_reached":
        return {
          title: "Daily Limit Reached",
          description: `You've used all ${limit} conversations today. Upgrade to Pro for unlimited conversations!`,
          icon: <Zap className="w-12 h-12 text-yellow-400" />
        }
      case "feature_locked":
        return {
          title: "Pro Feature",
          description: "This feature is available for Pro users. Upgrade to unlock advanced AI capabilities!",
          icon: <Crown className="w-12 h-12 text-purple-400" />
        }
      case "gentle_nudge":
        return {
          title: "Loving NEXUS?",
          description: `You've had ${currentUsage} great conversations today! Upgrade to Pro for unlimited access and advanced features.`,
          icon: <Crown className="w-12 h-12 text-purple-400" />
        }
    }
  }

  const content = getContent()

  const proFeatures = [
    "Unlimited conversations",
    "All expert advisors",
    "Advanced AI reasoning",
    "Multi-expert councils",
    "Priority support",
    "30-day context memory"
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 p-8 rounded-2xl border border-purple-500/50 backdrop-blur-md max-w-md w-full card-glow relative"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                {content.icon}
              </div>
              <h2 className="text-3xl font-bold mb-3 gradient-text">{content.title}</h2>
              <p className="text-gray-300">{content.description}</p>
            </div>

            {/* Features List */}
            <div className="bg-black/30 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                Pro Benefits
              </h3>
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-2">
                <span className="text-5xl font-bold gradient-text">$9.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                or $99/year (save 17%)
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link href="/pricing">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform">
                  Upgrade to Pro
                </button>
              </Link>

              {reason !== "limit_reached" && (
                <button
                  onClick={handleClose}
                  className="w-full border-2 border-purple-500 px-8 py-3 rounded-full font-semibold hover:bg-purple-500/10 transition-colors"
                >
                  Maybe Later
                </button>
              )}
            </div>

            {/* Trust Badge */}
            <p className="text-center text-sm text-gray-400 mt-6">
              💳 7-day money-back guarantee • Cancel anytime
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Compact version for in-app nudges
export function UpgradeBanner({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6" />
          <div>
            <h4 className="font-semibold">Unlock Unlimited Conversations</h4>
            <p className="text-sm opacity-90">Upgrade to Pro for just $9.99/month</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing">
            <button className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Upgrade
            </button>
          </Link>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
