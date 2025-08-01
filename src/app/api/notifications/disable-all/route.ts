import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendProfileUpdateNotification } from "@/utils/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await (await supabase).auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the athlete profile
    const { data: athlete, error: athleteError } = await (await supabase)
      .from("athletes")
      .select("id, athlete_name, username, allow_profile_notifications")
      .eq("user_id", user.id)
      .single()

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    // If notifications are already disabled, return early
    if (!athlete.allow_profile_notifications) {
      return NextResponse.json({
        message: "Profile notifications are already disabled",
        followerCount: 0,
      })
    }

    // Get all verified subscribers before disabling
    const { data: subscribers, error: subscribersError } = await (await supabase)
      .from("profile_subscriptions")
      .select("email, subscriber_name, unsubscribe_token")
      .eq("athlete_id", athlete.id)
      .eq("status", "verified")

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError)
    }

    // Disable profile notifications
    const { error: updateError } = await (await supabase)
      .from("athletes")
      .update({
        allow_profile_notifications: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", athlete.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to disable notifications" }, { status: 500 })
    }

    // Update all verified subscriptions to 'disabled' status
    const { error: disableError } = await (await supabase)
      .from("profile_subscriptions")
      .update({
        status: "disabled",
        updated_at: new Date().toISOString(),
      })
      .eq("athlete_id", athlete.id)
      .eq("status", "verified")

    if (disableError) {
      console.error("Error disabling subscriptions:", disableError)
    }

    // Send notification emails to all subscribers
    if (subscribers && subscribers.length > 0) {
      const emailPromises = subscribers.map(async (subscriber) => {
        try {
          await sendProfileUpdateNotification({
            to: subscriber.email,
            subscriberName: subscriber.subscriber_name || "Subscriber",
            athleteName: athlete.athlete_name,
            athleteUsername: athlete.username,
            updateType: "notifications_disabled",
            updateDescription: `${athlete.athlete_name} has disabled profile update notifications. You will no longer receive updates about their profile changes. If they re-enable notifications in the future, you will need to subscribe again.`,
            unsubscribeToken: subscriber.unsubscribe_token,
          })
        } catch (error) {
          console.error(`Failed to send notification to ${subscriber.email}:`, error)
        }
      })

      await Promise.allSettled(emailPromises)
    }

    return NextResponse.json({
      message: "Profile notifications disabled successfully",
      notifiedSubscribers: subscribers?.length || 0,
    })
  } catch (error) {
    console.error("Error disabling profile notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
