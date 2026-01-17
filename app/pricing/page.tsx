"use client"

import { useState, useEffect } from "react"
import { PLANS } from "@/lib/plans"
import { createBrowserSupabase } from "@/lib/supabase"

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

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

  const subscribe = async (priceId: string) => {
    setLoading(priceId)

    const res = await fetch("/api/chat/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        customerEmail: userEmail,
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">Pricing</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.values(PLANS).map((plan) => (
          <button
            key={plan.priceId}
            onClick={() => subscribe(plan.priceId)}
            disabled={loading === plan.priceId}
            className="rounded-xl bg-black text-white p-6 hover:opacity-90 disabled:opacity-50"
          >
            {loading === plan.priceId
              ? "Redirecting…"
              : `Subscribe to ${plan.name}`}
          </button>
        ))}
      </div>
    </div>
  )
}
