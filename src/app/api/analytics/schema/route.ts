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
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete profile not found" }, { status: 404 })
    }

    // Check if user has Pro subscription
    if (athlete.subscription_tier !== "pro") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 })
    }

    // Generate JSON-LD schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: `${athlete.first_name} ${athlete.last_name}`,
      alternateName: athlete.athlete_name,
      description: athlete.bio,
      image: athlete.profile_picture_url,
      url: `https://recruitmygame.com/${athlete.athlete_name}`,
      jobTitle: `${athlete.sport} Athlete`,
      worksFor: {
        "@type": "SportsTeam",
        name: athlete.current_team || "High School Athlete",
      },
      birthDate: athlete.birth_date,
      height: athlete.height ? `${athlete.height} inches` : undefined,
      weight: athlete.weight ? `${athlete.weight} lbs` : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: athlete.city,
        addressRegion: athlete.state,
        addressCountry: "US",
      },
      sameAs: [
        athlete.instagram_url,
        athlete.twitter_url,
        athlete.facebook_url,
        athlete.tiktok_url,
        athlete.youtube_url,
      ].filter(Boolean),
      sport: athlete.sport,
      award:
        athlete.athlete_awards?.map((award: any) => ({
          "@type": "Award",
          name: award.title,
          description: award.description,
          dateReceived: award.date_received,
        })) || [],
      memberOf:
        athlete.athlete_teams?.map((team: any) => ({
          "@type": "SportsTeam",
          name: team.team_name,
          sport: team.sport,
        })) || [],
    }

    // Remove undefined values
    const cleanSchema = JSON.parse(JSON.stringify(schema, (key, value) => (value === undefined ? undefined : value)))

    return NextResponse.json({
      schema: JSON.stringify(cleanSchema, null, 2),
    })
  } catch (error) {
    console.error("Schema generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
