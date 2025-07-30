import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { VerifiedReviewsManager } from "@/utils/verifiedReviews"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const athleteId = searchParams.get("athleteId")

    if (!athleteId) {
      return NextResponse.json({ error: "Athlete ID is required" }, { status: 400 })
    }

    // Get verified reviews
    const reviews = await VerifiedReviewsManager.getVerifiedReviews(athleteId)

    // Get verification stats
    const stats = await VerifiedReviewsManager.getVerificationStats(athleteId)

    return NextResponse.json({
      reviews,
      stats,
    })
  } catch (error) {
    console.error("Error fetching verified reviews:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
