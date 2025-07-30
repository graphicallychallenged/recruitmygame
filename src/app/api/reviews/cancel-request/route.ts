import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendReviewCancellationEmail } from "@/utils/email"

export async function DELETE(request: Request) {
  console.log("=== CANCEL REVIEW REQUEST API ROUTE HIT ===")

  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    // Get request ID from URL
    const url = new URL(request.url)
    const requestId = url.searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    console.log("Request ID:", requestId)

    // Get the verification request first to get athlete_id
    const { data: verificationRequest, error: fetchError } = await supabase
      .from("review_verification_requests")
      .select("*")
      .eq("id", requestId)
      .eq("status", "pending")
      .single()

    if (fetchError || !verificationRequest) {
      console.log("Verification request fetch error:", fetchError)
      return NextResponse.json({ error: "Verification request not found or already processed" }, { status: 404 })
    }

    console.log("Verification request found:", verificationRequest.id)

    // Get athlete profile using the athlete_id from the request
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("id, athlete_name, sport, school, user_id")
      .eq("id", verificationRequest.athlete_id)
      .single()

    if (athleteError || !athlete) {
      console.log("Athlete fetch error:", athleteError)
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    // Verify that the authenticated user owns this athlete profile
    if (athlete.user_id !== user.id) {
      console.log("User mismatch - authenticated:", user.id, "athlete owner:", athlete.user_id)
      return NextResponse.json({ error: "Unauthorized to cancel this request" }, { status: 403 })
    }

    console.log("Athlete found:", athlete.id)

    // Update the request status to cancelled
    const { error: updateError } = await supabase
      .from("review_verification_requests")
      .update({
        status: "cancelled",
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Failed to cancel request:", updateError)
      return NextResponse.json({ error: "Failed to cancel request" }, { status: 500 })
    }

    console.log("Request cancelled successfully")

    // Send cancellation email
    try {
      await sendReviewCancellationEmail({
        to: verificationRequest.reviewer_email,
        reviewerName: verificationRequest.reviewer_name,
        athleteName: athlete.athlete_name,
        athleteUsername: athlete.athlete_name,
        sport: athlete.sport || "Student Athlete",
        school: athlete.school || "High School",
        originalMessage: verificationRequest.request_message,
      })
      console.log("Cancellation email sent successfully")
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError)
      // Don't fail the request if email fails - the cancellation is still processed
    }

    return NextResponse.json({
      success: true,
      message: "Review request cancelled successfully",
    })
  } catch (error) {
    console.error("=== CANCEL REQUEST ERROR ===", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
