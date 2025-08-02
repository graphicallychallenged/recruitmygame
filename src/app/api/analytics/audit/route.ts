import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { auditAthleteProfile } from "@/utils/analytics"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get athlete profile
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("id, subscription_tier")
      .eq("user_id", user.id)
      .single()

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    // Check if user has Pro subscription
    if (athlete.subscription_tier !== "pro") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 })
    }

    // Get latest audit
    const { data: audit, error: auditError } = await supabase
      .from("profile_audits")
      .select("*")
      .eq("athlete_id", athlete.id)
      .order("audit_date", { ascending: false })
      .limit(1)
      .single()

    if (auditError && auditError.code !== "PGRST116") {
      console.error("Audit fetch error:", auditError)
      return NextResponse.json({ error: "Failed to fetch audit" }, { status: 500 })
    }

    return NextResponse.json(audit || null)
  } catch (error) {
    console.error("Audit GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get athlete profile
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    // Run the audit
    const auditResult = await auditAthleteProfile(athlete)

    // Save the audit results including audit_data
    const { data: savedAudit, error: saveError } = await supabase
      .from("profile_audits")
      .insert({
        athlete_id: athlete.id,
        completeness_score: auditResult.completeness_score,
        seo_score: auditResult.seo_score,
        social_score: auditResult.social_score,
        content_score: auditResult.content_score,
        recommendations: auditResult.recommendations,
        strengths: auditResult.strengths,
        missing_fields: auditResult.missing_fields,
        audit_data: auditResult.audit_data,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving audit:", saveError)
      return NextResponse.json({ error: "Failed to save audit" }, { status: 500 })
    }

    return NextResponse.json(savedAudit)
  } catch (error) {
    console.error("Error running audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
