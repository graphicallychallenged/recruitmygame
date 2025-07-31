import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params

    if (!token) {
      redirect("/unsubscribe-success?error=invalid_token")
    }

    const supabase = await createClient()

    // Find and delete the subscription with this token
    const { data: subscription, error: selectError } = await supabase
      .from("profile_update_subscriptions")
      .select("athlete_id, subscriber_email")
      .eq("unsubscribe_token", token)
      .single()

    if (selectError || !subscription) {
      redirect("/unsubscribe-success?error=token_not_found")
    }

    // Get athlete name for success page
    const { data: athlete } = await supabase
      .from("athletes")
      .select("athlete_name")
      .eq("id", subscription.athlete_id)
      .single()

    // Delete the subscription
    const { error: deleteError } = await supabase
      .from("profile_update_subscriptions")
      .delete()
      .eq("unsubscribe_token", token)

    if (deleteError) {
      console.error("Error unsubscribing:", deleteError)
      redirect("/unsubscribe-success?error=unsubscribe_failed")
    }

    // Also remove any pending notifications for this subscriber
    await supabase
      .from("notification_queue")
      .delete()
      .eq("athlete_id", subscription.athlete_id)
      .eq("recipient_email", subscription.subscriber_email)
      .eq("status", "pending")

    redirect(
      `/unsubscribe-success?status=unsubscribed&athlete=${encodeURIComponent(athlete?.athlete_name || "Athlete")}`,
    )
  } catch (error) {
    console.error("Error in unsubscribe API:", error)
    redirect("/unsubscribe-success?error=server_error")
  }
}
