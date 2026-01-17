import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabase, Database } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
})

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 })
  }

  const supabase = createServerSupabase()

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Map Stripe subscription to Supabase profile
        const { data: profile } = await (supabase
          .from("profiles") as any)
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!profile?.id) {
          console.warn("No Supabase profile found for customer:", customerId)
          break
        }

        // Determine tier based on subscription plan
        const planId = subscription.items.data[0]?.price.id || null
        let tier: string = "free"

        // Map your price IDs to tiers here
        const proMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
        const proYearlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY

        if (planId === proMonthlyId || planId === proYearlyId) {
          tier = "pro"
        }

        const { error } = await (supabase
          .from("profiles") as any)
          .update({ subscription_tier: tier })
          .eq("id", profile.id)

        if (error) {
          console.error("Error updating subscription tier:", error)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Error handling webhook:", err)
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 })
  }
}
