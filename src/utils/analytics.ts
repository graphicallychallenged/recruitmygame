import { createClient } from "@/utils/supabase/server"
import type { AthleteProfile } from "@/types/database"

export interface AuditResult {
  completeness_score: number
  seo_score: number
  social_score: number
  content_score: number
  recommendations: string[]
  strengths: string[]
  missing_fields: string[]
  audit_data: Record<string, any>
}

export async function auditAthleteProfile(athlete: AthleteProfile): Promise<AuditResult> {
  const supabase = createClient()
  const recommendations: string[] = []
  const strengths: string[] = []
  const missing_fields: string[] = []
  const audit_data: Record<string, any> = {}

  // Completeness Score (0-100)
  const requiredFields = [
    "athlete_name",
    "sport",
    "school",
    "location",
    "bio",
    "profile_picture_url",
    "grade",
    "graduation_year",
  ]

  const optionalFields = ["height", "weight", "gpa", "positions_played", "email", "phone"]

  const socialFields = ["instagram", "twitter", "facebook", "youtube", "linkedin", "website"]

  let completedRequired = 0
  let completedOptional = 0
  let completedSocial = 0

  // Check required fields
  requiredFields.forEach((field) => {
    const value = athlete[field as keyof AthleteProfile]
    if (value && value !== "") {
      completedRequired++
    } else {
      missing_fields.push(field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()))
    }
  })

  // Check optional fields
  optionalFields.forEach((field) => {
    const value = athlete[field as keyof AthleteProfile]
    if (value && value !== "") {
      completedOptional++
    }
  })

  // Check social fields
  socialFields.forEach((field) => {
    const value = athlete[field as keyof AthleteProfile]
    if (value && value !== "") {
      completedSocial++
    }
  })

  const completeness_score = Math.round(
    (completedRequired / requiredFields.length) * 60 +
      (completedOptional / optionalFields.length) * 25 +
      (completedSocial / socialFields.length) * 15,
  )

  // SEO Score (0-100)
  let seo_score = 0

  // Bio length and quality
  if (athlete.bio) {
    if (athlete.bio.length > 150) {
      seo_score += 25
      strengths.push("Comprehensive bio that helps with search visibility")
    } else if (athlete.bio.length > 50) {
      seo_score += 15
      recommendations.push("Expand your bio to at least 150 characters for better SEO")
    } else {
      seo_score += 5
      recommendations.push("Write a longer, more detailed bio for better search rankings")
    }
  } else {
    recommendations.push("Add a bio to improve your profile's search visibility")
  }

  // Location for local SEO
  if (athlete.location) {
    seo_score += 20
    strengths.push("Location information helps with local search results")
  } else {
    recommendations.push("Add your location to improve local search visibility")
  }

  // School information
  if (athlete.school) {
    seo_score += 20
    strengths.push("School information enhances your athletic profile")
  }

  // Sport and positions
  if (athlete.sport) {
    seo_score += 15
    if (athlete.positions_played && athlete.positions_played.length > 0) {
      seo_score += 10
      strengths.push("Specific position information helps coaches find you")
    } else {
      recommendations.push("Add your playing positions for better discoverability")
    }
  }

  // Academic info
  if (athlete.gpa || athlete.sat_score || athlete.act_score) {
    seo_score += 10
    strengths.push("Academic information appeals to college recruiters")
  } else {
    recommendations.push("Add academic information (GPA, SAT/ACT scores) to attract college recruiters")
  }

  // Social Score (0-100)
  let social_score = 0
  const socialPlatforms = ["instagram", "twitter", "facebook", "youtube", "linkedin"]
  const activePlatforms = socialPlatforms.filter((platform) => athlete[platform as keyof AthleteProfile]).length

  social_score = Math.round((activePlatforms / socialPlatforms.length) * 70)

  if (athlete.website) {
    social_score += 15
    strengths.push("Personal website adds professional credibility")
  } else {
    recommendations.push("Consider creating a personal website for additional online presence")
  }

  if (athlete.enable_social_sharing) {
    social_score += 15
    strengths.push("Social sharing enabled to increase profile visibility")
  } else {
    recommendations.push("Enable social sharing to help others promote your profile")
  }

  if (activePlatforms >= 3) {
    strengths.push("Strong social media presence across multiple platforms")
  } else if (activePlatforms >= 1) {
    recommendations.push("Consider adding more social media platforms to increase your reach")
  } else {
    recommendations.push("Add social media links to build your online presence")
  }

  // Content Score (0-100)
  let content_score = 0

  // Check for photos
  try {
    const { data: photos } = await supabase.from("athlete_photos").select("id").eq("athlete_id", athlete.id).limit(1)

    if (photos && photos.length > 0) {
      content_score += 25
      strengths.push("Photo gallery showcases your athletic achievements")
    } else {
      recommendations.push("Add photos to make your profile more engaging")
    }
  } catch (error) {
    console.error("Error checking photos:", error)
  }

  // Check for videos (Premium/Pro feature)
  if (athlete.subscription_tier === "premium" || athlete.subscription_tier === "pro") {
    try {
      const { data: videos } = await supabase.from("athlete_videos").select("id").eq("athlete_id", athlete.id).limit(1)

      if (videos && videos.length > 0) {
        content_score += 25
        strengths.push("Video content provides dynamic showcase of your skills")
      } else {
        recommendations.push("Add highlight videos to showcase your athletic abilities")
      }
    } catch (error) {
      console.error("Error checking videos:", error)
    }
  }

  // Check for awards (Premium/Pro feature)
  if (athlete.subscription_tier === "premium" || athlete.subscription_tier === "pro") {
    try {
      const { data: awards } = await supabase.from("athlete_awards").select("id").eq("athlete_id", athlete.id).limit(1)

      if (awards && awards.length > 0) {
        content_score += 25
        strengths.push("Awards and achievements demonstrate your competitive success")
      } else {
        recommendations.push("Add your awards and achievements to highlight your accomplishments")
      }
    } catch (error) {
      console.error("Error checking awards:", error)
    }
  }

  // Check for reviews (Premium/Pro feature)
  if (athlete.subscription_tier === "premium" || athlete.subscription_tier === "pro") {
    try {
      const { data: reviews } = await supabase
        .from("athlete_reviews")
        .select("id")
        .eq("athlete_id", athlete.id)
        .eq("is_approved", true)
        .limit(1)

      if (reviews && reviews.length > 0) {
        content_score += 25
        strengths.push("Coach and peer reviews add credibility to your profile")
      } else {
        recommendations.push("Request reviews from coaches and teammates to build credibility")
      }
    } catch (error) {
      console.error("Error checking reviews:", error)
    }
  }

  // Profile picture quality
  if (athlete.profile_picture_url) {
    strengths.push("Professional profile picture creates a strong first impression")
  } else {
    recommendations.push("Add a professional profile picture")
  }

  // Store audit data
  audit_data.required_fields_completed = completedRequired
  audit_data.optional_fields_completed = completedOptional
  audit_data.social_platforms_connected = activePlatforms
  audit_data.total_fields_checked = requiredFields.length + optionalFields.length + socialFields.length

  return {
    completeness_score,
    seo_score,
    social_score,
    content_score,
    recommendations,
    strengths,
    missing_fields,
    audit_data,
  }
}

export function generateSEOSchema(athlete: AthleteProfile): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: athlete.athlete_name,
    url: `https://${athlete.username}.recruitmygame.com`,
    image: athlete.profile_picture_url,
    description: athlete.bio,
    jobTitle: `${athlete.sport} Athlete`,
    worksFor: {
      "@type": "EducationalOrganization",
      name: athlete.school,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: athlete.location,
    },
    sameAs: [
      athlete.instagram && `https://instagram.com/${athlete.instagram.replace("@", "")}`,
      athlete.twitter && `https://twitter.com/${athlete.twitter.replace("@", "")}`,
      athlete.facebook && athlete.facebook,
      athlete.youtube && athlete.youtube,
      athlete.linkedin && athlete.linkedin,
      athlete.website && athlete.website,
    ].filter(Boolean),
    knowsAbout: [athlete.sport, ...(athlete.positions_played || [])],
    alumniOf: athlete.school && {
      "@type": "EducationalOrganization",
      name: athlete.school,
    },
    hasOccupation: {
      "@type": "Occupation",
      name: `${athlete.sport} Athlete`,
      occupationLocation: {
        "@type": "Place",
        name: athlete.location,
      },
    },
  }

  return JSON.stringify(schema, null, 2)
}

export async function getClientInfo(request: Request) {
  const userAgent = request.headers.get("user-agent") || ""
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"

  // Simple device detection
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  const deviceType = isMobile ? "Mobile" : "Desktop"

  // Simple browser detection
  let browser = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  // Simple OS detection
  let os = "Unknown"
  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iOS")) os = "iOS"

  return {
    ip,
    userAgent,
    deviceType,
    browser,
    os,
  }
}

export async function trackPageView(
  athleteId: string,
  sessionId: string,
  pagePath: string,
  pageTitle?: string,
  referrer?: string,
) {
  try {
    const response = await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        athleteId,
        sessionId,
        pagePath,
        pageTitle,
        referrer,
      }),
    })

    if (!response.ok) {
      console.error("Failed to track page view:", response.statusText)
    }
  } catch (error) {
    console.error("Error tracking page view:", error)
  }
}

export interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  topReferrers: Array<{ domain: string; count: number }>
  topPages: Array<{ path: string; count: number }>
  dailyViews: Array<{ date: string; views: number; visitors: number }>
  deviceBreakdown: Array<{ device: string; count: number }>
  browserBreakdown: Array<{ browser: string; count: number }>
}

export interface ProfileAuditResult {
  completenessScore: number
  seoScore: number
  socialScore: number
  contentScore: number
  recommendations: string[]
  strengths: string[]
  missingFields: string[]
}

export async function getAnalyticsData(athleteId: string, days = 30): Promise<AnalyticsData> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get page views and sessions
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("*, visitor_sessions(*)")
    .eq("athlete_id", athleteId)
    .gte("viewed_at", startDate.toISOString())

  const { data: sessions } = await supabase
    .from("visitor_sessions")
    .select("*")
    .eq("athlete_id", athleteId)
    .gte("session_start", startDate.toISOString())

  // Calculate metrics
  const totalViews = pageViews?.length || 0
  const uniqueVisitors = new Set(sessions?.map((s) => s.session_id)).size
  const bounceRate = sessions?.length
    ? (sessions.filter((s) => s.pages_visited === 1).length / sessions.length) * 100
    : 0
  const avgSessionDuration = sessions?.length
    ? sessions.reduce((acc, s) => acc + (s.total_time || 0), 0) / sessions.length
    : 0

  // Top referrers
  const referrerCounts = new Map<string, number>()
  sessions?.forEach((session) => {
    if (session.referrer) {
      try {
        const domain = new URL(session.referrer).hostname
        referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1)
      } catch {
        referrerCounts.set(session.referrer, (referrerCounts.get(session.referrer) || 0) + 1)
      }
    }
  })
  const topReferrers = Array.from(referrerCounts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Top pages
  const pageCounts = new Map<string, number>()
  pageViews?.forEach((view) => {
    pageCounts.set(view.page_path, (pageCounts.get(view.page_path) || 0) + 1)
  })
  const topPages = Array.from(pageCounts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Daily views
  const dailyViewsMap = new Map<string, { views: number; visitors: Set<string> }>()
  pageViews?.forEach((view) => {
    const date = new Date(view.viewed_at).toISOString().split("T")[0]
    if (!dailyViewsMap.has(date)) {
      dailyViewsMap.set(date, { views: 0, visitors: new Set() })
    }
    const dayData = dailyViewsMap.get(date)!
    dayData.views++
    if (view.visitor_sessions?.session_id) {
      dayData.visitors.add(view.visitor_sessions.session_id)
    }
  })
  const dailyViews = Array.from(dailyViewsMap.entries())
    .map(([date, data]) => ({ date, views: data.views, visitors: data.visitors.size }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Device breakdown
  const deviceCounts = new Map<string, number>()
  sessions?.forEach((session) => {
    const device = session.device_type || "Unknown"
    deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1)
  })
  const deviceBreakdown = Array.from(deviceCounts.entries()).map(([device, count]) => ({ device, count }))

  // Browser breakdown
  const browserCounts = new Map<string, number>()
  sessions?.forEach((session) => {
    const browser = session.browser || "Unknown"
    browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1)
  })
  const browserBreakdown = Array.from(browserCounts.entries()).map(([browser, count]) => ({ browser, count }))

  return {
    totalViews,
    uniqueVisitors,
    bounceRate,
    avgSessionDuration,
    topReferrers,
    topPages,
    dailyViews,
    deviceBreakdown,
    browserBreakdown,
  }
}

export async function auditProfile(athleteId: string): Promise<ProfileAuditResult> {
  const supabase = createClient()

  const { data: athlete } = await supabase.from("athletes").select("*").eq("id", athleteId).single()

  if (!athlete) {
    throw new Error("Athlete not found")
  }

  const recommendations: string[] = []
  const strengths: string[] = []
  const missingFields: string[] = []

  // Check completeness
  let completenessScore = 0
  const requiredFields = [
    "athlete_name",
    "sport",
    "bio",
    "location",
    "graduation_year",
    "profile_picture_url",
    "height",
    "weight",
  ]

  requiredFields.forEach((field) => {
    if (athlete[field]) {
      completenessScore += 12.5 // 100 / 8 fields
    } else {
      missingFields.push(field.replace("_", " "))
    }
  })

  // SEO Score
  let seoScore = 0
  if (athlete.bio && athlete.bio.length > 100) {
    seoScore += 25
    strengths.push("Good bio length for SEO")
  } else {
    recommendations.push("Add a detailed bio (100+ characters) to improve SEO")
  }

  if (athlete.athlete_name && athlete.sport) {
    seoScore += 25
    strengths.push("Has name and sport for search optimization")
  }

  if (athlete.location) {
    seoScore += 25
    strengths.push("Location helps with local search")
  }

  if (athlete.graduation_year) {
    seoScore += 25
    strengths.push("Graduation year helps recruiters find you")
  }

  // Social Score
  let socialScore = 0
  const socialFields = ["instagram", "twitter", "facebook", "youtube", "tiktok"]
  const connectedSocial = socialFields.filter((field) => athlete[field]).length
  socialScore = (connectedSocial / socialFields.length) * 100

  if (connectedSocial > 0) {
    strengths.push(`Connected to ${connectedSocial} social platforms`)
  } else {
    recommendations.push("Connect social media accounts to increase visibility")
  }

  // Content Score
  let contentScore = 0

  // Check for photos
  const { data: photos } = await supabase.from("athlete_photos").select("id").eq("athlete_id", athleteId)

  if (photos && photos.length > 0) {
    contentScore += 25
    strengths.push(`Has ${photos.length} photos`)
  } else {
    recommendations.push("Add photos to showcase your athletic abilities")
  }

  // Check for videos
  const { data: videos } = await supabase.from("athlete_videos").select("id").eq("athlete_id", athleteId)

  if (videos && videos.length > 0) {
    contentScore += 25
    strengths.push(`Has ${videos.length} videos`)
  } else {
    recommendations.push("Add highlight videos to attract recruiters")
  }

  // Check for awards
  const { data: awards } = await supabase.from("athlete_awards").select("id").eq("athlete_id", athleteId)

  if (awards && awards.length > 0) {
    contentScore += 25
    strengths.push(`Has ${awards.length} awards listed`)
  } else {
    recommendations.push("Add your awards and achievements")
  }

  // Check for schedule
  const { data: schedule } = await supabase.from("athlete_schedule").select("id").eq("athlete_id", athleteId)

  if (schedule && schedule.length > 0) {
    contentScore += 25
    strengths.push("Has upcoming events scheduled")
  } else {
    recommendations.push("Add your game/event schedule")
  }

  return {
    completenessScore: Math.round(completenessScore),
    seoScore,
    socialScore: Math.round(socialScore),
    contentScore,
    recommendations,
    strengths,
    missingFields,
  }
}