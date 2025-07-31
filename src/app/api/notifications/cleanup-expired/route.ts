import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Delete expired unverified subscriptions
    const { data, error } = await supabase
      .from("profile_update_subscriptions")
      .delete()
      .eq("is_verified", false)
      .lt("verification_expires_at", new Date().toISOString())

    if (error) {
      console.error("Error cleaning up expired subscriptions:", error)
      return NextResponse.json({ error: "Failed to cleanup expired subscriptions" }, { status: 500 })
    }

    console.log("Cleaned up expired subscriptions:", data)

    return NextResponse.json({
      success: true,
      message: "Expired subscriptions cleaned up successfully",
    })
  } catch (error) {
    console.error("Error in cleanup:", error)
    return NextResponse.json({ error: "Failed to cleanup expired subscriptions" }, { status: 500 })
  }
}
