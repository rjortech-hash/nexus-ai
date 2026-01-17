import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabase, Database } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
})

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { userId, priceId } = await req.json()

    if (!userId || !priceId) {
      return NextResponse.json(
        { error: "Missing userId or priceId" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()

    // -------------------------------
    // Fetch user profile
    // -------------------------------
    type ProfileRow = { email: string | null }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle<ProfileRow>()

    if (profileError || !profile?.email) {
      return NextResponse.json(
        { error: "User not found or missing email" },
        { status: 404 }
      )
    }

    // -------------------------------
    // Fetch subscription
    // -------------------------------
    type SubscriptionRow = { stripe_customer_id: string | null }
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle<SubscriptionRow>()

    let customerId: string

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id
    } else {
      // -------------------------------
      // Create new Stripe customer
      // -------------------------------
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id

      // -------------------------------
      // Save customer ID in Supabase
      // -------------------------------
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          stripe_customer_id: customerId,
        } as Database["public"]["Tables"]["subscriptions"]["Insert"])

      if (insertError) {
        console.error("Error inserting subscription:", insertError)
        return NextResponse.json(
          { error: "Failed to save subscription" },
          { status: 500 }
        )
      }
    }

    // -------------------------------
    // Create Stripe Checkout session
    // -------------------------------
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error in create-checkout route:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
