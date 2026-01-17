import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const { priceId, customerEmail } = await req.json()

  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
