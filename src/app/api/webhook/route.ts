import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/utils/stripe/config"
import { createClient } from "@/utils/supabase/server"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription" && session.metadata) {
          const { athlete_id, tier } = session.metadata

          // Update athlete subscription tier
          await supabase
            .from("athletes")
            .update({
              subscription_tier: tier,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", athlete_id)

          console.log(`Subscription activated for athlete ${athlete_id}: ${tier}`)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Get athlete by customer ID
        const { data: athlete } = await supabase
          .from("athletes")
          .select("id")
          .eq("stripe_customer_id", subscription.customer as string)
          .single()

        if (athlete) {
          let tier = "free"

          // Determine tier based on price ID
          const priceId = subscription.items.data[0]?.price.id

          if (priceId === STRIPE_CONFIG.priceIds.premium.monthly || priceId === STRIPE_CONFIG.priceIds.premium.yearly) {
            tier = "premium"
          } else if (priceId === STRIPE_CONFIG.priceIds.pro.monthly || priceId === STRIPE_CONFIG.priceIds.pro.yearly) {
            tier = "pro"
          }

          await supabase
            .from("athletes")
            .update({
              subscription_tier: tier,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", athlete.id)

          console.log(`Subscription updated for athlete ${athlete.id}: ${tier}`)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Get athlete by customer ID
        const { data: athlete } = await supabase
          .from("athletes")
          .select("id")
          .eq("stripe_customer_id", subscription.customer as string)
          .single()

        if (athlete) {
          // Downgrade to free tier
          await supabase
            .from("athletes")
            .update({
              subscription_tier: "free",
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", athlete.id)

          console.log(`Subscription canceled for athlete ${athlete.id}`)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        // Get athlete by customer ID
        const { data: athlete } = await supabase
          .from("athletes")
          .select("id, athlete_name")
          .eq("stripe_customer_id", invoice.customer as string)
          .single()

        if (athlete) {
          console.log(`Payment failed for athlete: ${athlete.athlete_name}`)
          // You could send an email notification here
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
