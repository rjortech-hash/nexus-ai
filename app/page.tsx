'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Brain, Sparkles, Shield, Users, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [email, setEmail] = useState('')

  const experts = [
    { name: 'Business Strategy', icon: '💼', color: 'from-blue-500 to-cyan-500' },
    { name: 'Mental Health', icon: '🧠', color: 'from-purple-500 to-pink-500' },
    { name: 'Relationships', icon: '❤️', color: 'from-red-500 to-orange-500' },
    { name: 'Fitness', icon: '💪', color: 'from-green-500 to-emerald-500' },
    { name: 'Creative', icon: '🎨', color: 'from-yellow-500 to-amber-500' },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold gradient-text">NEXUS</span>
          </div>
          <Link href="/chat">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Launch App
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Your Personal Board of Advisors,
              <br />
              <span className="gradient-text">Available 24/7</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered experts who know your story, guide your decisions, and evolve with you.
              From therapy to strategy, fitness to creativity—get world-class advice whenever you need it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/chat">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2">
                  Start Your 7-Day Transformation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <button className="border-2 border-purple-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-500/10 transition-colors">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>200K+ professionals trust their biggest decisions to NEXUS</span>
            </div>
          </motion.div>

          {/* Expert Carousel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto"
          >
            {experts.map((expert, i) => (
              <motion.div
                key={expert.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.1, y: -10 }}
                className={`relative bg-gradient-to-br ${expert.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-white/10`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-3 text-center">{expert.icon}</div>
                  <div className="font-bold text-center text-sm">{expert.name}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why <span className="gradient-text">NEXUS</span> Changes Everything
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-12 h-12" />}
              title="Context-Aware Intelligence"
              description="NEXUS remembers your goals, challenges, and patterns. Every conversation builds on your history."
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Private & Secure"
              description="Your deepest thoughts stay encrypted. We never train our models on your data."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title="Multi-Expert Councils"
              description="Get diverse perspectives by convening multiple experts who debate your challenges."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 200,000+ people who've found clarity, confidence, and breakthroughs with NEXUS.
          </p>
          <Link href="/chat">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-5 rounded-full text-xl font-semibold hover:scale-105 transition-transform card-glow">
              Start Free Today
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 NEXUS AI. Built with Claude by Anthropic.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm"
    >
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}