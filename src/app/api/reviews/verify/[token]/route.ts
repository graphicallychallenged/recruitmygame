import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params
    const supabase = await createClient()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Get verification request
    const { data: verificationRequest, error: requestError } = await supabase
      .from("review_verification_requests")
      .select("*")
      .eq("verification_token", token)
      .eq("status", "pending")
      .single()

    if (requestError || !verificationRequest) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Check if expired
    if (new Date(verificationRequest.expires_at) < new Date()) {
      await supabase.from("review_verification_requests").update({ status: "expired" }).eq("id", verificationRequest.id)
      return NextResponse.json({ error: "Verification link has expired" }, { status: 400 })
    }

    // Get athlete info using the correct column names from the database
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("athlete_name, sport, school, profile_picture_url")
      .eq("id", verificationRequest.athlete_id)
      .single()

    if (athleteError) {
      console.error("Error getting athlete:", athleteError)
      return NextResponse.json({ error: "Failed to get athlete info" }, { status: 500 })
    }

    return NextResponse.json({ request: verificationRequest, athlete })
  } catch (error: any) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params
    const body = await request.json()
    const {
      review_text,
      rating,
      review_type,
      reviewer_phone,
      reviewer_image_url,
      can_contact_reviewer,
      athleticism,
      character,
      work_ethic,
      leadership,
      coachability,
      teamwork,
      relationship,
      years_known,
      would_recommend,
    } = body
    const supabase = await createClient()

    if (!token || !review_text || !rating || !review_type || !relationship || !years_known || !would_recommend) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get verification request
    const { data: verificationRequest, error: requestError } = await supabase
      .from("review_verification_requests")
      .select("*")
      .eq("verification_token", token)
      .eq("status", "pending")
      .single()

    if (requestError || !verificationRequest) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Check if expired
    if (new Date(verificationRequest.expires_at) < new Date()) {
      return NextResponse.json({ error: "Verification link has expired" }, { status: 400 })
    }

    // Create the verified review with all the required fields
    const { data: review, error: reviewError } = await supabase
      .from("athlete_reviews")
      .insert({
        athlete_id: verificationRequest.athlete_id,
        reviewer_name: verificationRequest.reviewer_name,
        reviewer_email: verificationRequest.reviewer_email,
        reviewer_phone: reviewer_phone || null,
        reviewer_image_url: reviewer_image_url || null,
        reviewer_title: verificationRequest.reviewer_title,
        reviewer_organization: verificationRequest.reviewer_organization,
        can_contact_reviewer: can_contact_reviewer || false,
        review_text,
        rating: Number.parseInt(rating),
        review_type,
        athleticism,
        character,
        work_ethic,
        leadership,
        coachability,
        teamwork,
        relationship,
        years_known,
        would_recommend,
        review_date: new Date().toISOString(),
        is_verified: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (reviewError) {
      console.error("Error creating review:", reviewError)
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
    }

    // Update verification request status
    await supabase
      .from("review_verification_requests")
      .update({
        status: "completed",
        review_id: review.id,
      })
      .eq("id", verificationRequest.id)

    return NextResponse.json({ success: true, review })
  } catch (error: any) {
    console.error("Error creating verified review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
