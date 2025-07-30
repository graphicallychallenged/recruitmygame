import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { ComplianceManager } from "@/utils/compliance"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await (await supabase).auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reason, confirmation } = body

    if (confirmation !== "DELETE_MY_ACCOUNT") {
      return NextResponse.json(
        { error: 'Invalid confirmation. Please type "DELETE_MY_ACCOUNT" to confirm.' },
        { status: 400 },
      )
    }

    // Check if user already has a pending deletion request
    const { data: existingRequest } = await (await supabase)
      .from("data_deletion_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single()

    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending account deletion request" }, { status: 409 })
    }

    const deletionRequest = await ComplianceManager.requestAccountDeletion(user.id, reason)

    if (!deletionRequest) {
      return NextResponse.json({ error: "Failed to create deletion request" }, { status: 500 })
    }

    // For this demo, process deletion immediately
    // In production, this would require email verification and have a grace period
    const success = await ComplianceManager.processAccountDeletion(user.id)

    if (success) {
      // Sign out the user
      await (await supabase).auth.signOut()

      return NextResponse.json({
        success: true,
        message: "Your account has been scheduled for deletion. You have been signed out.",
        deletion_request_id: deletionRequest.id,
      })
    } else {
      return NextResponse.json({ error: "Failed to process account deletion" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in delete account API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
