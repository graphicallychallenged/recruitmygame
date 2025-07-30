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
    const { consent_type, consent_given } = body

    if (!consent_type || typeof consent_given !== "boolean") {
      return NextResponse.json({ error: "consent_type and consent_given are required" }, { status: 400 })
    }

    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const consent = await ComplianceManager.recordConsent(user.id, consent_type, consent_given, clientIP, userAgent)

    if (!consent) {
      return NextResponse.json({ error: "Failed to record consent" }, { status: 500 })
    }

    return NextResponse.json({ success: true, consent })
  } catch (error) {
    console.error("Error in consent API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const consents = await ComplianceManager.getUserConsents(user.id)
    return NextResponse.json({ consents })
  } catch (error) {
    console.error("Error fetching consents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
