import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendContactNotificationEmail } from "@/utils/email"

interface ContactFormData {
  athleteId: string
  name: string
  email: string
  organization?: string
  message: string
}

export async function POST(request: NextRequest) {
const supabase = await createClient()
  try {
    const data: ContactFormData = await request.json()

    const { athleteId, name, email, organization, message } = data

    if (!athleteId || !name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get athlete information
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("athlete_name, username, user_id")
      .eq("id", athleteId)
      .single()

    if (athleteError || !athlete) {
      console.error("Error fetching athlete:", athleteError)
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 })
    }

    // Get athlete's email from auth.users
    const { data: authUser, error: authError } = await supabase
      .from("auth.users")
      .select("email")
      .eq("id", athlete.user_id)
      .single()

    if (authError || !authUser) {
      console.error("Error fetching athlete email:", authError)
      return NextResponse.json({ error: "Unable to send notification" }, { status: 500 })
    }

    // Send notification email to athlete
    await sendContactNotificationEmail({
      athleteEmail: authUser.email,
      athleteName: athlete.athlete_name,
      contactorName: name,
      contactorEmail: email,
      contactorOrganization: organization,
      message: message,
      athleteUsername: athlete.username,
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    })
  } catch (error: any) {
    console.error("Error sending contact message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
