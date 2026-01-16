import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseServerClient()

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let customerId: string

    // Check if customer exists
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id

      // Save customer ID
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/chat?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        user_id: userId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}