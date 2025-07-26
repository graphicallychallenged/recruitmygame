import { notFound } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import PublicProfileClient from "./PublicProfileClient"
import type { AthleteProfile } from "@/types/database"

interface PublicProfilePageProps {
  params: {
    athleteName: string
  }
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { athleteName } = params

  try {
    // Fetch athlete by username - get fresh data every time
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("*")
      .eq("username", athleteName)
      .eq("is_public", true)
      .single()

    if (athleteError || !athlete) {
      notFound()
    }

    const athleteProfile: AthleteProfile = {
      id: athlete.id,
      user_id: athlete.user_id,
      athlete_name: athlete.athlete_name,
      username: athlete.username,
      sport: athlete.sport,
      sports: athlete.sports,
      grade: athlete.grade,
      graduation_year: athlete.graduation_year,
      school: athlete.school,
      location: athlete.location,
      bio: athlete.bio,
      height: athlete.height,
      weight: athlete.weight,
      gpa: athlete.gpa,
      sat_score: athlete.sat_score,
      act_score: athlete.act_score,
      positions_played: athlete.positions_played,
      profile_picture_url: athlete.profile_picture_url,
      primary_color: athlete.primary_color,
      secondary_color: athlete.secondary_color,
      subscription_tier: athlete.subscription_tier,
      is_profile_public: athlete.is_profile_public,
      content_order: athlete.content_order,
      created_at: athlete.created_at,
      updated_at: athlete.updated_at,
      theme_mode: athlete.theme_mode
    }

    return <PublicProfileClient athlete={athleteProfile} />
  } catch (error) {
    console.error("Error fetching profile:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { athleteName } = params

  try {
    const { data: athlete } = await supabase
      .from("athletes")
      .select("athlete_name, bio, sport, school")
      .eq("username", athleteName)
      .eq("is_public", true)
      .single()

    if (!athlete) {
      return {
        title: "Athlete Not Found",
      }
    }

    return {
      title: `${athlete.athlete_name} - ${athlete.sport} Athlete`,
      description:
        athlete.bio ||
        `${athlete.athlete_name} is a ${athlete.sport} athlete${athlete.school ? ` at ${athlete.school}` : ""}.`,
    }
  } catch (error) {
    return {
      title: "Athlete Profile",
    }
  }
}
