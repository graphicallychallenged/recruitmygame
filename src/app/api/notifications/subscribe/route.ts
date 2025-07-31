import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendSubscriptionVerificationEmail } from "@/utils/email"
import crypto from "crypto"

function getAvailableNotificationTypes(tier: string) {
  const allTypes = [
    { id: "new_video", requiredTier: "free" },
    { id: "new_photos", requiredTier: "pro" },
    { id: "schedule_updates", requiredTier: "free" },
    { id: "new_reviews", requiredTier: "premium" },
    { id: "new_awards", requiredTier: "pro" },
  ]

  const tierHierarchy = { free: 0, pro: 1, premium: 2 }
  const currentTierLevel = tierHierarchy[tier as keyof typeof tierHierarchy] ?? 0

  return allTypes.filter((type) => {
    const requiredLevel = tierHierarchy[type.requiredTier as keyof typeof tierHierarchy] ?? 0
    return currentTierLevel >= requiredLevel
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { athleteId, email, name, notificationTypes } = await request.json()

    console.log("Subscribe request:", { athleteId, email, name, notificationTypes })

    if (!athleteId || !email || !notificationTypes || notificationTypes.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if athlete exists first
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("athlete_name, username, subscription_tier")
      .eq("id", athleteId)
      .single()

    if (athleteError || !athlete) {
      console.error("Athlete not found:", athleteError)
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 })
    }

    // Check for ANY existing subscription (verified or unverified)
    const { data: existingSubscription, error: existingError } = await supabase
      .from("profile_update_subscriptions")
      .select("id, is_verified, notification_types, verification_token")
      .eq("athlete_id", athleteId)
      .eq("subscriber_email", email)
      .maybeSingle()

    if (existingError) {
      console.error("Error checking existing subscription:", existingError)
      return NextResponse.json({ error: "Failed to check existing subscription" }, { status: 500 })
    }

    // If user already has a verified subscription
    if (existingSubscription && existingSubscription.is_verified) {
      return NextResponse.json(
        {
          error: "You are already subscribed to updates from this athlete. Check your email for notifications.",
        },
        { status: 409 },
      )
    }

    // If user has an unverified subscription, inform them
    if (existingSubscription && !existingSubscription.is_verified) {
      return NextResponse.json(
        {
          error:
            "You already have a pending subscription. Please check your email and verify your subscription, or wait 24 hours to subscribe again.",
        },
        { status: 409 },
      )
    }

    // Validate notification types against athlete's tier
    const availableTypes = getAvailableNotificationTypes(athlete.subscription_tier || "free")
    const validTypes = notificationTypes.filter((type: string) => availableTypes.some((t) => t.id === type))

    if (validTypes.length === 0) {
      return NextResponse.json({ error: "No valid notification types for this tier" }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24) // 24 hour expiry

    // Create new subscription (we already checked no existing subscription exists)
    const subscriptionData = {
      athlete_id: athleteId,
      subscriber_email: email,
      subscriber_name: name,
      notification_types: validTypes,
      is_verified: false,
      verification_token: verificationToken,
      verification_expires_at: verificationExpiry.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("profile_update_subscriptions")
      .insert(subscriptionData)
      .select()
      .single()

    if (subscriptionError) {
      console.error("Subscription error:", subscriptionError)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    // Send verification email
    try {
      await sendSubscriptionVerificationEmail({
        to: email,
        subscriberName: name || "Subscriber",
        athleteName: athlete.athlete_name || athlete.username,
        athleteUsername: athlete.username,
        verificationToken: verificationToken,
        notificationTypes: validTypes,
      })
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      // Don't fail the subscription if email fails - subscription was created successfully
    }

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully. Please check your email to verify within 24 hours.",
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
