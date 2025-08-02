import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

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
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get athlete profile with all data
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select(`
        *,
        athlete_photos(*),
        athlete_videos(*),
        athlete_awards(*),
        athlete_teams(*),
        athlete_schedule(*)
      `)
      .eq("user_id", user.id)
      .single()

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    // Check if user has Pro subscription
    if (athlete.subscription_tier !== "pro") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 })
    }

    // Calculate audit scores
    const auditResult = calculateProfileAudit(athlete)

    // Save audit to database
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
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving audit:", saveError)
      return NextResponse.json({ error: "Failed to save audit" }, { status: 500 })
    }

    return NextResponse.json(savedAudit)
  } catch (error) {
    console.error("Audit POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateProfileAudit(athlete: any) {
  const recommendations: string[] = []
  const strengths: string[] = []
  const missing_fields: string[] = []

  // Completeness Score (0-100)
  let completenessScore = 0
  const requiredFields = [
    "first_name",
    "last_name",
    "sport",
    "position",
    "bio",
    "height",
    "weight",
    "graduation_year",
    "profile_picture_url",
  ]

  requiredFields.forEach((field) => {
    if (athlete[field]) {
      completenessScore += 100 / requiredFields.length
    } else {
      missing_fields.push(field)
    }
  })

  // Bonus points for optional fields
  if (athlete.hero_image_url) completenessScore += 5
  if (athlete.athlete_photos?.length > 0) completenessScore += 5
  if (athlete.athlete_videos?.length > 0) completenessScore += 10

  completenessScore = Math.min(100, Math.round(completenessScore))

  // SEO Score (0-100)
  let seoScore = 0
  if (athlete.bio && athlete.bio.length > 50) seoScore += 30
  if (athlete.sport && athlete.position) seoScore += 20
  if (athlete.athlete_name && athlete.athlete_name.length > 0) seoScore += 20
  if (athlete.graduation_year) seoScore += 15
  if (athlete.location) seoScore += 15

  // Social Score (0-100)
  let socialScore = 0
  const socialFields = ["instagram_url", "twitter_url", "facebook_url", "tiktok_url", "youtube_url"]
  socialFields.forEach((field) => {
    if (athlete[field]) socialScore += 20
  })

  // Content Score (0-100)
  let contentScore = 0
  if (athlete.bio && athlete.bio.length > 100) contentScore += 25
  if (athlete.athlete_photos?.length >= 3) contentScore += 25
  if (athlete.athlete_videos?.length >= 1) contentScore += 30
  if (athlete.athlete_awards?.length > 0) contentScore += 20

  // Generate recommendations
  if (completenessScore < 80) {
    recommendations.push("Complete all required profile fields to improve visibility")
  }
  if (!athlete.hero_image_url) {
    recommendations.push("Add a hero image to make your profile more visually appealing")
  }
  if (!athlete.athlete_videos || athlete.athlete_videos.length === 0) {
    recommendations.push("Upload highlight videos to showcase your skills")
  }
  if (!athlete.athlete_photos || athlete.athlete_photos.length < 3) {
    recommendations.push("Add more photos to create a comprehensive visual portfolio")
  }
  if (socialScore < 40) {
    recommendations.push("Connect your social media accounts to increase your online presence")
  }
  if (!athlete.bio || athlete.bio.length < 100) {
    recommendations.push("Write a more detailed bio to tell your story effectively")
  }

  // Generate strengths
  if (athlete.athlete_videos?.length > 0) {
    strengths.push("Great video content showcasing your athletic abilities")
  }
  if (athlete.athlete_photos?.length >= 3) {
    strengths.push("Strong visual portfolio with multiple photos")
  }
  if (athlete.bio && athlete.bio.length > 150) {
    strengths.push("Comprehensive bio that tells your story well")
  }
  if (socialScore >= 60) {
    strengths.push("Strong social media presence across multiple platforms")
  }
  if (athlete.athlete_awards?.length > 0) {
    strengths.push("Documented achievements and awards")
  }

  return {
    completeness_score: completenessScore,
    seo_score: Math.round(seoScore),
    social_score: Math.round(socialScore),
    content_score: Math.round(contentScore),
    recommendations,
    strengths,
    missing_fields,
  }
}
