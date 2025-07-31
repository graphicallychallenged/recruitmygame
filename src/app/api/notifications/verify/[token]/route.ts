import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const supabase = await createClient()
    const { token } = params

    if (!token) {
      redirect("/subscription-error?error=missing-token")
    }

    // Find the subscription with this verification token
    const { data: subscription, error: subscriptionError } = await supabase
      .from("profile_update_subscriptions")
      .select("*")
      .eq("verification_token", token)
      .eq("is_verified", false)
      .single()

    if (subscriptionError || !subscription) {
      console.error("Subscription not found or already verified:", subscriptionError)
      redirect("/subscription-error?error=invalid-token")
    }

    // Check if token has expired
    const now = new Date()
    const expiryDate = new Date(subscription.verification_expires_at)

    if (now > expiryDate) {
      // Delete expired subscription
      await supabase.from("profile_update_subscriptions").delete().eq("id", subscription.id)

      redirect("/subscription-error?error=expired-token")
    }

    // Verify the subscription
    const { error: updateError } = await supabase
      .from("profile_update_subscriptions")
      .update({
        is_verified: true,
        verification_token: null,
        verification_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)

    if (updateError) {
      console.error("Error verifying subscription:", updateError)
      redirect("/subscription-error?error=verification-failed")
    }

    // Get athlete info for success page
    const { data: athlete } = await supabase
      .from("athletes")
      .select("athlete_name, username")
      .eq("id", subscription.athlete_id)
      .single()

    const athleteName = athlete?.athlete_name || athlete?.username || "the athlete"

    redirect(`/subscription-success?athlete=${encodeURIComponent(athleteName)}`)
  } catch (error) {
    console.error("Error in verification:", error)
    redirect("/subscription-error?error=server-error")
  }
}
