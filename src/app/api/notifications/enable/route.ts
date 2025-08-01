import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the athlete profile
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("id, athlete_name, username, allow_profile_notifications")
      .eq("user_id", user.id)
      .single()

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    // If notifications are already enabled, return early
    if (athlete.allow_profile_notifications) {
      return NextResponse.json({
        message: "Profile notifications are already enabled",
      })
    }

    // Enable profile notifications
    const { error: updateError } = await supabase
      .from("athletes")
      .update({
        allow_profile_notifications: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", athlete.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to enable notifications" }, { status: 500 })
    }

    // Note: We don't automatically re-enable disabled subscriptions
    // Users will need to subscribe again if they want to receive notifications

    return NextResponse.json({
      message: "Profile notifications enabled successfully. Previous subscribers will need to subscribe again.",
    })
  } catch (error) {
    console.error("Error enabling profile notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
