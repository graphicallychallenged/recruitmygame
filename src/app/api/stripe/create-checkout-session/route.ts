import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/utils/stripe/config"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { tier, billing, athleteId, userId } = await request.json()

    const supabase = await createClient()

    // Get athlete data
    const { data: athlete, error } = await supabase
      .from("athletes")
      .select("athlete_name, email")
      .eq("id", athleteId)
      .single()

    if (error || !athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 })
    }

    // Determine price ID based on tier and billing
    let priceId: string
    if (tier === "premium") {
      priceId = billing === "yearly" ? STRIPE_CONFIG.priceIds.premium.yearly : STRIPE_CONFIG.priceIds.premium.monthly
    } else if (tier === "pro") {
      priceId = billing === "yearly" ? STRIPE_CONFIG.priceIds.pro.yearly : STRIPE_CONFIG.priceIds.pro.monthly
    } else {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/subscription?canceled=true`,
      customer_email: athlete.email,
      metadata: {
        athlete_id: athleteId,
        user_id: userId,
        tier: tier,
        billing: billing,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
