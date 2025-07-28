import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/utils/stripe/config"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { athleteId } = await request.json()

    const supabase = await createClient()

    // Get athlete's Stripe customer ID
    const { data: athlete, error } = await supabase
      .from("athletes")
      .select("stripe_customer_id")
      .eq("id", athleteId)
      .single()

    if (error || !athlete?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    // Create Stripe portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: athlete.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
