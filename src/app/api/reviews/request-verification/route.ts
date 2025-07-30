import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendReviewRequestEmail } from "@/utils/email"

export async function POST(request: Request) {
  console.log("=== VERIFICATION REQUEST API ROUTE HIT ===")
  console.log("Method:", request.method)
  console.log("URL:", request.url)

  try {
    console.log("Creating supabase client...")
    const supabase = await createClient()
    console.log("Supabase client created successfully")

    console.log("Getting user...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("User result:", { user: user?.id, authError })

    if (authError || !user) {
      console.log("Auth failed, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Getting athlete profile...")
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("id, subscription_tier, athlete_name, sport, school, email")
      .eq("user_id", user.id)
      .single()

    console.log("Athlete result:", { athlete, athleteError })

    if (athleteError || !athlete) {
      console.log("Athlete not found, returning 404")
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    if (athlete.subscription_tier !== "pro" && athlete.subscription_tier !== "premium") {
      console.log("Not pro user, returning 403")
      return NextResponse.json({ error: "Pro subscription required for verified reviews" }, { status: 403 })
    }

    console.log("Parsing request body...")
    const body = await request.json()
    console.log("Request body:", body)

    const { reviewer_name, reviewer_email, reviewer_title, reviewer_organization, request_message } = body

    if (!reviewer_name || !reviewer_email || !request_message) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reviewer_email)) {
      console.log("Invalid email format")
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if athlete is trying to use their own email
    if (
      reviewer_email.toLowerCase() === user.email?.toLowerCase() ||
      reviewer_email.toLowerCase() === athlete.email?.toLowerCase()
    ) {
      console.log("Athlete trying to use their own email")
      return NextResponse.json(
        {
          error: "You cannot request a review from yourself. Please use your coach's or mentor's email address.",
        },
        { status: 400 },
      )
    }

    console.log("Generating verification token...")
    const verificationToken = globalThis.crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    console.log("Token generated:", verificationToken)

    console.log("Inserting verification request...")
    const { data: verificationRequest, error: insertError } = await supabase
      .from("review_verification_requests")
      .insert({
        athlete_id: athlete.id,
        reviewer_name,
        reviewer_email,
        reviewer_title: reviewer_title || null,
        reviewer_organization: reviewer_organization || null,
        request_message,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .select()
      .single()

    console.log("Insert result:", { verificationRequest, insertError })

    if (insertError) {
      console.error("Database insert error:", insertError)
      return NextResponse.json({ error: "Failed to create verification request" }, { status: 500 })
    }

    // Send actual email using the email utility
    console.log("Sending verification email...")
    try {
      await sendReviewRequestEmail({
        to: reviewer_email,
        reviewerName: reviewer_name,
        athleteName: athlete.athlete_name,
        athleteUsername: athlete.athlete_name,
        sport: athlete.sport || "Student Athlete",
        school: athlete.school || "High School",
        message: request_message,
        verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-review/${verificationToken}`,
      })
      console.log("Email sent successfully")
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      // Don't fail the request if email fails - the verification request is still created
      // You might want to add a retry mechanism or queue here
    }

    console.log("Returning success response...")
    return NextResponse.json({
      success: true,
      message: "Verification request sent successfully",
      verificationId: verificationRequest.id,
    })
  } catch (error) {
    console.error("=== API ROUTE ERROR ===")
    console.error("Caught error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    console.error("=== END ERROR ===")

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
