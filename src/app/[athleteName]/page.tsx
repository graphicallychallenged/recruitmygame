import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import PublicProfileClient from "./PublicProfileClient"
import type { AthleteProfile } from "@/types/database"
import type { Metadata } from "next"

interface PageProps {
  params: {
    athleteName: string
  }
}

export default async function AthletePage({ params }: PageProps) {
  const { athleteName } = params
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    // First try to find by custom subdomain
    const { data: customSubdomainData, error: customSubdomainError } = await supabase
      .from("athletes")
      .select("*")
      .eq("subdomain", athleteName)
      .eq("is_profile_public", true)
      .single()

    if (customSubdomainData) {
      console.log(`Found athlete by custom subdomain: ${athleteName}`)

      // Transform the data to match our AthleteProfile type
      const athlete: AthleteProfile = {
        id: customSubdomainData.id,
        user_id: customSubdomainData.user_id,
        athlete_name: customSubdomainData.athlete_name,
        username: customSubdomainData.username,
        sport: customSubdomainData.sport,
        sports: customSubdomainData.sports,
        grade: customSubdomainData.grade,
        graduation_year: customSubdomainData.graduation_year,
        school: customSubdomainData.school,
        location: customSubdomainData.location,
        bio: customSubdomainData.bio,
        height: customSubdomainData.height,
        weight: customSubdomainData.weight,
        gpa: customSubdomainData.gpa,
        sat_score: customSubdomainData.sat_score,
        act_score: customSubdomainData.act_score,
        positions_played: customSubdomainData.positions_played,
        dominant_foot: customSubdomainData.dominant_foot,
        dominant_hand: customSubdomainData.dominant_hand,
        profile_picture_url: customSubdomainData.profile_picture_url,
        primary_color: customSubdomainData.primary_color,
        secondary_color: customSubdomainData.secondary_color,
        subscription_tier: customSubdomainData.subscription_tier,
        subscription_status: customSubdomainData.subscription_status,
        stripe_customer_id: customSubdomainData.stripe_customer_id,
        stripe_subscription_id: customSubdomainData.stripe_subscription_id,
        is_profile_public: customSubdomainData.is_profile_public,
        content_order: customSubdomainData.content_order,
        email: customSubdomainData.email,
        phone: customSubdomainData.phone,
        show_email: customSubdomainData.show_email,
        show_phone: customSubdomainData.show_phone,
        theme_mode: customSubdomainData.theme_mode || "light",
        created_at: customSubdomainData.created_at,
        updated_at: customSubdomainData.updated_at,
        hero_image_url: customSubdomainData.hero_image_url,
        instagram: customSubdomainData.instagram,
        twitter: customSubdomainData.twitter,
        tiktok: customSubdomainData.tiktok,
        facebook: customSubdomainData.facebook,
        youtube: customSubdomainData.youtube,
        linkedin: customSubdomainData.linkedin,
        website: customSubdomainData.website,
        maxpreps_url: customSubdomainData.maxpreps_url,
        ncsa_url: customSubdomainData.ncsa_url,
        other_recruiting_profiles: customSubdomainData.other_recruiting_profiles,
        profile_visibility: customSubdomainData.profile_visibility,
      }

      return <PublicProfileClient athlete={athlete} />
    }

    // If no custom subdomain match, try username BUT only if the athlete doesn't have a custom subdomain set
    const { data: usernameData, error: usernameError } = await supabase
      .from("athletes")
      .select("*")
      .eq("username", athleteName)
      .eq("is_profile_public", true)
      .single()

    if (usernameData) {
      // CRITICAL: If this athlete has a custom subdomain set, don't allow access via username
      if (usernameData.subdomain && usernameData.subdomain !== athleteName) {
        console.log(`Athlete ${athleteName} has custom subdomain ${usernameData.subdomain}, blocking username access`)
        notFound()
      }

      console.log(`Found athlete by username: ${athleteName}`)

      // Transform the data to match our AthleteProfile type
      const athlete: AthleteProfile = {
        id: usernameData.id,
        user_id: usernameData.user_id,
        athlete_name: usernameData.athlete_name,
        username: usernameData.username,
        sport: usernameData.sport,
        sports: usernameData.sports,
        grade: usernameData.grade,
        graduation_year: usernameData.graduation_year,
        school: usernameData.school,
        location: usernameData.location,
        bio: usernameData.bio,
        height: usernameData.height,
        weight: usernameData.weight,
        gpa: usernameData.gpa,
        sat_score: usernameData.sat_score,
        act_score: usernameData.act_score,
        positions_played: usernameData.positions_played,
        dominant_foot: usernameData.dominant_foot,
        dominant_hand: usernameData.dominant_hand,
        profile_picture_url: usernameData.profile_picture_url,
        primary_color: usernameData.primary_color,
        secondary_color: usernameData.secondary_color,
        subscription_tier: usernameData.subscription_tier,
        subscription_status: usernameData.subscription_status,
        stripe_customer_id: usernameData.stripe_customer_id,
        stripe_subscription_id: usernameData.stripe_subscription_id,
        is_profile_public: usernameData.is_profile_public,
        content_order: usernameData.content_order,
        email: usernameData.email,
        phone: usernameData.phone,
        show_email: usernameData.show_email,
        show_phone: usernameData.show_phone,
        theme_mode: usernameData.theme_mode || "light",
        created_at: usernameData.created_at,
        updated_at: usernameData.updated_at,
        hero_image_url: usernameData.hero_image_url,
        instagram: usernameData.instagram,
        twitter: usernameData.twitter,
        tiktok: usernameData.tiktok,
        facebook: usernameData.facebook,
        youtube: usernameData.youtube,
        linkedin: usernameData.linkedin,
        website: usernameData.website,
        maxpreps_url: usernameData.maxpreps_url,
        ncsa_url: usernameData.ncsa_url,
        other_recruiting_profiles: usernameData.other_recruiting_profiles,
        profile_visibility: usernameData.profile_visibility,
      }

      return <PublicProfileClient athlete={athlete} />
    }

    // No athlete found
    console.error("Athlete not found:", athleteName)
    notFound()
  } catch (error) {
    console.error("Error fetching athlete:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { athleteName } = params
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    let athleteData = null
    const profileUrl = `https://recruitmygame.com/${athleteName}`

    // Try custom subdomain first
    const { data: customSubdomainData } = await supabase
      .from("athletes")
      .select(
        "athlete_name, sport, school, bio, location, graduation_year, profile_picture_url, hero_image_url, grade, positions_played",
      )
      .eq("subdomain", athleteName)
      .eq("is_profile_public", true)
      .single()

    if (customSubdomainData) {
      athleteData = customSubdomainData
    } else {
      // Try username, but check if they have a custom subdomain
      const { data: usernameData } = await supabase
        .from("athletes")
        .select(
          "athlete_name, sport, school, bio, location, graduation_year, profile_picture_url, hero_image_url, grade, positions_played, subdomain",
        )
        .eq("username", athleteName)
        .eq("is_profile_public", true)
        .single()

      if (usernameData) {
        // If they have a custom subdomain, don't generate metadata for username access
        if (usernameData.subdomain && usernameData.subdomain !== athleteName) {
          return {
            title: "Athlete Not Found",
            robots: {
              index: false,
              follow: false,
            },
          }
        }
        athleteData = usernameData
      }
    }

    if (!athleteData) {
      return {
        title: "Athlete Not Found | RecruitMyGame",
        description: "The athlete profile you're looking for could not be found.",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    // Create rich description
    const gradeText = athleteData.grade ? `${athleteData.grade} ` : ""
    const schoolText = athleteData.school ? ` at ${athleteData.school}` : ""
    const locationText = athleteData.location ? ` from ${athleteData.location}` : ""
    const graduationText = athleteData.graduation_year ? ` (Class of ${athleteData.graduation_year})` : ""
    const positionsText = athleteData.positions_played ? ` playing ${athleteData.positions_played}` : ""

    const description =
      athleteData.bio ||
      `${athleteData.athlete_name} is a ${gradeText}${athleteData.sport} athlete${schoolText}${locationText}${graduationText}${positionsText}. View their athletic profile, stats, and recruiting information.`

    // Determine the best image for social sharing
    const socialImage = athleteData.hero_image_url || athleteData.profile_picture_url || "/logo-horizontal.png"

    // Create structured title
    const title = `${athleteData.athlete_name} - ${athleteData.sport} Athlete | RecruitMyGame`

    return {
      title,
      description,
      keywords: [
        athleteData.athlete_name,
        athleteData.sport,
        "athlete",
        "recruiting",
        "college recruiting",
        "sports profile",
        athleteData.school,
        athleteData.location,
        "athletic recruiting",
        "student athlete",
      ]
        .filter(Boolean)
        .join(", "),
      authors: [{ name: athleteData.athlete_name }],
      creator: athleteData.athlete_name,
      publisher: "RecruitMyGame",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        type: "profile",
        title,
        description,
        url: profileUrl,
        siteName: "RecruitMyGame",
        images: [
          {
            url: socialImage,
            width: 1200,
            height: 630,
            alt: `${athleteData.athlete_name} - ${athleteData.sport} Athlete Profile`,
          },
          {
            url: socialImage,
            width: 1080,
            height: 1080,
            alt: `${athleteData.athlete_name} - ${athleteData.sport} Athlete Profile`,
          },
        ],
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [socialImage],
        creator: athleteData.twitter ? `@${athleteData.twitter}` : "@RecruitMyGame",
        site: "@RecruitMyGame",
      },
      alternates: {
        canonical: profileUrl,
      },
      other: {
        "profile:first_name": athleteData.athlete_name.split(" ")[0],
        "profile:last_name": athleteData.athlete_name.split(" ").slice(1).join(" "),
        "profile:username": athleteName,
        "article:author": athleteData.athlete_name,
        "article:section": "Sports",
        "article:tag": [athleteData.sport, "athlete", "recruiting"].join(","),
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Athlete Profile | RecruitMyGame",
      description: "View athlete profiles and recruiting information on RecruitMyGame.",
      robots: {
        index: false,
        follow: true,
      },
    }
  }
}
