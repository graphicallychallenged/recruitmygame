import type { Metadata } from "next"
import { createStaticClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import PublicProfileClient from "./PublicProfileClient"

interface PageProps {
  params: {
    athleteName: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createStaticClient()

  console.log("generateMetadata - Full params object:", JSON.stringify(params, null, 2))
  console.log("generateMetadata - athleteName:", params.athleteName)
  console.log("generateMetadata - typeof athleteName:", typeof params.athleteName)

  try {
    const { data: athlete, error } = await supabase
      .from("athletes")
      .select("athlete_name, sport, school, location")
      .eq("username", params.athleteName)
      .single()

    console.log("generateMetadata - Database query result:", { athlete, error })

    if (!athlete || error) {
      return {
        title: "Athlete Not Found",
        description: "The requested athlete profile could not be found.",
      }
    }

    return {
      title: `${athlete.athlete_name} - ${athlete.sport} | RecruitMyGame`,
      description: `View ${athlete.athlete_name}'s athletic profile. ${athlete.sport} player from ${athlete.school} in ${athlete.location}.`,
      openGraph: {
        title: `${athlete.athlete_name} - ${athlete.sport}`,
        description: `${athlete.sport} player from ${athlete.school}`,
        type: "profile",
      },
    }
  } catch (error) {
    console.error("generateMetadata - Error:", error)
    return {
      title: "Athlete Profile | RecruitMyGame",
      description: "View athlete profiles on RecruitMyGame",
    }
  }
}

export default async function AthletePage({ params }: PageProps) {
  const supabase = createStaticClient()

  console.log("AthletePage - Full params object:", JSON.stringify(params, null, 2))
  console.log("AthletePage - athleteName:", params.athleteName)
  console.log("AthletePage - typeof athleteName:", typeof params.athleteName)

  try {
    const { data: athlete, error } = await supabase
      .from("athletes")
      .select("*")
      .eq("username", params.athleteName)
      .single()

    console.log("AthletePage - Database result:", { athlete, error, username: params.athleteName })

    if (error || !athlete) {
      console.log("AthletePage - Athlete not found, redirecting to 404")
      notFound()
    }

    console.log("AthletePage - Found athlete:", athlete.athlete_name)
    return <PublicProfileClient athlete={athlete} />
  } catch (error) {
    console.error("AthletePage - Unexpected error:", error)
    notFound()
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()

  try {
    const { data: athletes, error } = await supabase
      .from("athletes")
      .select("username")
      .eq("subscription_status", "active")

    console.log("generateStaticParams - Athletes found:", athletes?.length || 0)
    console.log("generateStaticParams - Athletes data:", athletes)

    return (
      athletes?.map((athlete) => ({
        athleteName: athlete.username,
      })) || []
    )
  } catch (error) {
    console.error("generateStaticParams - Error:", error)
    return []
  }
}
