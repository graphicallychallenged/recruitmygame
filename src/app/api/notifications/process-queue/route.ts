import { createClient } from "@/utils/supabase/server"
import { sendProfileUpdateNotification } from "@/utils/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Verify this is an internal request (you might want to add authentication)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get pending notifications
    const { data: notifications, error } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("created_at")
      .limit(50) // Process in batches

    if (error) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    let processed = 0
    let failed = 0

    for (const notification of notifications) {
      try {
        // Get athlete info for the notification
        const { data: athlete } = await supabase
          .from("athletes")
          .select("athlete_name, username")
          .eq("id", notification.athlete_id)
          .single()

        if (!athlete) {
          console.error("Athlete not found for notification:", notification.id)
          continue
        }

        // Get subscription info for unsubscribe token
        const { data: subscription } = await supabase
          .from("profile_update_subscriptions")
          .select("unsubscribe_token")
          .eq("athlete_id", notification.athlete_id)
          .eq("subscriber_email", notification.recipient_email)
          .single()

        if (!subscription) {
          console.error("Subscription not found for notification:", notification.id)
          continue
        }

        // Send the email
        await sendProfileUpdateNotification({
          to: notification.recipient_email,
          subscriberName: notification.recipient_name,
          athleteName: athlete.athlete_name,
          athleteUsername: athlete.username,
          updateType: formatNotificationType(notification.notification_type),
          updateDescription: notification.content,
          unsubscribeToken: subscription.unsubscribe_token,
        })

        // Mark as sent
        await supabase
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", notification.id)

        processed++
      } catch (emailError) {
        console.error("Error sending notification:", emailError)

        // Mark as failed
        await supabase
          .from("notification_queue")
          .update({
            status: "failed",
            error_message: emailError instanceof Error ? emailError.message : "Unknown error",
          })
          .eq("id", notification.id)

        failed++
      }
    }

    return NextResponse.json({
      processed,
      failed,
      total: notifications.length,
    })
  } catch (error) {
    console.error("Error processing notification queue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function formatNotificationType(type: string): string {
  const typeMap: Record<string, string> = {
    new_video: "New Video",
    new_photos: "New Photos",
    schedule_updates: "Schedule Update",
    new_reviews: "New Review",
    new_awards: "New Award",
  }
  return typeMap[type] || type
}
