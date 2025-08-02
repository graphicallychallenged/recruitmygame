import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const supabase = await createClient()
    const { token } = params

    console.log("Verification attempt for token:", token)

    if (!token) {
      console.log("No token provided")
      return NextResponse.redirect(new URL("/subscription-error?error=missing-token", request.url))
    }

    // Find the subscription with this verification token
    const { data: subscription, error: subscriptionError } = await supabase
      .from("profile_update_subscriptions")
      .select("*")
      .eq("verification_token", token)
      .eq("is_verified", false)
      .single()

    console.log("Subscription query result:", { subscription, subscriptionError })

    if (subscriptionError || !subscription) {
      console.error("Subscription not found or already verified:", subscriptionError)

      // Check if token exists but is already verified
      const { data: verifiedSub } = await supabase
        .from("profile_update_subscriptions")
        .select("*")
        .eq("verification_token", token)
        .eq("is_verified", true)
        .single()

      if (verifiedSub) {
        console.log("Token already verified, redirecting to success")
        const { data: athlete } = await supabase
          .from("athletes")
          .select("athlete_name, username")
          .eq("id", verifiedSub.athlete_id)
          .single()

        const athleteName = athlete?.athlete_name || athlete?.username || "the athlete"
        return NextResponse.redirect(
          new URL(`/subscription-success?athlete=${encodeURIComponent(athleteName)}`, request.url),
        )
      }

      return NextResponse.redirect(new URL("/subscription-error?error=invalid-token", request.url))
    }

    // Check if token has expired
    const now = new Date()
    const expiryDate = new Date(subscription.verification_expires_at)

    console.log("Token expiry check:", { now, expiryDate, expired: now > expiryDate })

    if (now > expiryDate) {
      console.log("Token expired, deleting subscription")
      // Delete expired subscription
      await supabase.from("profile_update_subscriptions").delete().eq("id", subscription.id)

      return NextResponse.redirect(new URL("/subscription-error?error=expired-token", request.url))
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

    console.log("Verification update result:", { updateError })

    if (updateError) {
      console.error("Error verifying subscription:", updateError)
      return NextResponse.redirect(new URL("/subscription-error?error=verification-failed", request.url))
    }

    // Get athlete info for success page
    const { data: athlete } = await supabase
      .from("athletes")
      .select("athlete_name, username")
      .eq("id", subscription.athlete_id)
      .single()

    console.log("Athlete data:", athlete)

    const athleteName = athlete?.athlete_name || athlete?.username || "the athlete"

    console.log("Redirecting to success with athlete:", athleteName)

    return NextResponse.redirect(
      new URL(`/subscription-success?athlete=${encodeURIComponent(athleteName)}`, request.url),
    )
  } catch (error) {
    console.error("Error in verification:", error)
    return NextResponse.redirect(new URL("/subscription-error?error=server-error", request.url))
  }
}
