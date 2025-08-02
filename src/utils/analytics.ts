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

  // REVISED COMPLETENESS SCORE - More comprehensive and meaningful
  let completeness_score = 0

  // Core Profile Information (40 points total)
  const coreFields = [
    { field: "athlete_name", points: 5, label: "Athlete Name" },
    { field: "sport", points: 5, label: "Sport" },
    { field: "bio", points: 8, label: "Bio" },
    { field: "school", points: 5, label: "School" },
    { field: "location", points: 5, label: "Location" },
    { field: "graduation_year", points: 4, label: "Graduation Year" },
    { field: "profile_picture_url", points: 5, label: "Profile Picture" },
    { field: "grade", points: 3, label: "Grade" },
  ]

  coreFields.forEach(({ field, points, label }) => {
    const value = athlete[field as keyof AthleteProfile]
    if (value && value !== "") {
      completeness_score += points
      audit_data[`has_${field}`] = true
    } else {
      missing_fields.push(label)
      audit_data[`has_${field}`] = false
    }
  })

  // Athletic Details (20 points total)
  const athleticFields = [
    { field: "height", points: 3, label: "Height" },
    { field: "weight", points: 3, label: "Weight" },
    { field: "positions_played", points: 5, label: "Positions Played" },
    { field: "gpa", points: 4, label: "GPA" },
    { field: "sat_score", points: 2.5, label: "SAT Score" },
    { field: "act_score", points: 2.5, label: "ACT Score" },
  ]

  athleticFields.forEach(({ field, points, label }) => {
    const value = athlete[field as keyof AthleteProfile]
    if (value && (Array.isArray(value) ? value.length > 0 : value !== "")) {
      completeness_score += points
      audit_data[`has_${field}`] = true
    } else {
      if (points >= 4) missing_fields.push(label) // Only add important missing fields
      audit_data[`has_${field}`] = false
    }
  })

  // Teams (10 points) - CRITICAL for athlete profiles
  try {
    const { data: teams } = await supabase.from("athlete_teams").select("id").eq("athlete_id", athlete.id)
    const teamCount = teams?.length || 0
    audit_data.team_count = teamCount

    if (teamCount > 0) {
      completeness_score += 10
      strengths.push(`Listed ${teamCount} team${teamCount > 1 ? "s" : ""} in athletic history`)
    } else {
      missing_fields.push("Team History")
      recommendations.push("Add your current and past teams to show your athletic journey")
    }
  } catch (error) {
    console.error("Error checking teams:", error)
    audit_data.team_count = 0
  }

  // Content & Media (15 points)
  let contentPoints = 0

  // Photos (3 points)
  try {
    const { data: photos } = await supabase.from("athlete_photos").select("id").eq("athlete_id", athlete.id)
    const photoCount = photos?.length || 0
    audit_data.photo_count = photoCount

    if (photoCount > 0) {
      contentPoints += 3
      if (photoCount >= 5) {
        strengths.push(`Strong photo gallery with ${photoCount} images`)
      }
    } else {
      recommendations.push("Add photos to showcase your athletic abilities")
    }
  } catch (error) {
    audit_data.photo_count = 0
  }

  // Videos (4 points)
  try {
    const { data: videos } = await supabase.from("athlete_videos").select("id").eq("athlete_id", athlete.id)
    const videoCount = videos?.length || 0
    audit_data.video_count = videoCount

    if (videoCount > 0) {
      contentPoints += 4
      strengths.push(`${videoCount} video${videoCount > 1 ? "s" : ""} showcasing athletic skills`)
    } else if (athlete.subscription_tier !== "free") {
      recommendations.push("Add highlight videos to attract recruiters")
    }
  } catch (error) {
    audit_data.video_count = 0
  }

  // Awards (4 points)
  try {
    const { data: awards } = await supabase.from("athlete_awards").select("id").eq("athlete_id", athlete.id)
    const awardCount = awards?.length || 0
    audit_data.award_count = awardCount

    if (awardCount > 0) {
      contentPoints += 4
      strengths.push(`${awardCount} documented achievement${awardCount > 1 ? "s" : ""}`)
    } else if (athlete.subscription_tier !== "free") {
      recommendations.push("Add your awards and achievements")
    }
  } catch (error) {
    audit_data.award_count = 0
  }

  // Verified Reviews (4 points) - CRITICAL for credibility
  try {
    const { data: allReviews } = await supabase
      .from("athlete_reviews")
      .select("id, is_verified")
      .eq("athlete_id", athlete.id)

    const totalReviews = allReviews?.length || 0
    const verifiedReviews = allReviews?.filter((review) => review.is_verified) || []
    const verifiedCount = verifiedReviews.length

    audit_data.total_reviews = totalReviews
    audit_data.verified_reviews = verifiedCount

    if (verifiedCount > 0) {
      contentPoints += 4
      strengths.push(`${verifiedCount} verified review${verifiedCount > 1 ? "s" : ""} from coaches`)
    } else if (totalReviews > 0) {
      contentPoints += 1
      recommendations.push("Request verification for your existing reviews to build credibility")
    } 
  } catch (error) {
    audit_data.total_reviews = 0
    audit_data.verified_reviews = 0
  }

  completeness_score += contentPoints

  // Social Media & Contact (15 points)
  const socialFields = ["instagram", "twitter", "facebook", "youtube", "linkedin", "website"]
  const contactFields = ["email", "phone"]

  let socialPoints = 0
  let connectedSocial = 0

  socialFields.forEach((field) => {
    const value = athlete[field as keyof AthleteProfile]
    if (value && value !== "") {
      connectedSocial++
      socialPoints += 2 // 12 points max for social
    }
  })

  contactFields.forEach((field) => {
    const value = athlete[field as keyof AthleteProfile]
    if (value && value !== "") {
      socialPoints += 1.5 // 3 points max for contact
    } else {
      if (field === "email") missing_fields.push("Contact Email")
    }
  })

  completeness_score += Math.min(socialPoints, 15)
  audit_data.social_platforms_connected = connectedSocial

  // Cap completeness at 100
  completeness_score = Math.min(Math.round(completeness_score), 100)

  // SEO Score (0-100) - Enhanced
  let seo_score = 0

  // Bio quality and length (30 points)
  if (athlete.bio) {
    const bioLength = athlete.bio.length
    if (bioLength > 200) {
      seo_score += 30
      strengths.push("Comprehensive bio that tells your story well")
    } else if (bioLength > 100) {
      seo_score += 20
      recommendations.push("Expand your bio to over 200 characters for better storytelling")
    } else if (bioLength > 50) {
      seo_score += 10
      recommendations.push("Write a more detailed bio to improve search visibility")
    } else {
      seo_score += 5
      recommendations.push("Create a compelling bio that tells your athletic story")
    }
  } else {
    recommendations.push("Add a bio to improve your profile's search visibility")
  }

  // Location and school (25 points)
  if (athlete.location && athlete.school) {
    seo_score += 25
    strengths.push("Location and school information enhance discoverability")
  } else if (athlete.location || athlete.school) {
    seo_score += 15
    if (!athlete.location) recommendations.push("Add your location for local search visibility")
    if (!athlete.school) recommendations.push("Add your school information")
  } else {
    recommendations.push("Add location and school information for better search results")
  }

  // Sport and position specificity (20 points)
  if (athlete.sport) {
    seo_score += 10
    if (athlete.positions_played && athlete.positions_played.length > 0) {
      seo_score += 10
      strengths.push("Specific position information helps coaches find you")
    } else {
      recommendations.push("Add your playing positions for better discoverability")
    }
  }

  // Academic information (15 points)
  if (athlete.gpa || athlete.sat_score || athlete.act_score) {
    seo_score += 15
    strengths.push("Academic information appeals to college recruiters")
  } else {
    recommendations.push("Add academic information (GPA, test scores) to attract college recruiters")
  }

  // Graduation year (10 points)
  if (athlete.graduation_year) {
    seo_score += 10
  } else {
    recommendations.push("Add graduation year to help recruiters find athletes in your class")
  }

  // Social Score (0-100) - Simplified but meaningful
  let social_score = 0
  const socialPlatforms = ["instagram", "twitter", "facebook", "youtube", "linkedin"]
  const activePlatforms = socialPlatforms.filter((platform) => athlete[platform as keyof AthleteProfile]).length

  // Base social media presence (70 points)
  social_score = Math.round((activePlatforms / socialPlatforms.length) * 70)

  // Personal website bonus (15 points)
  if (athlete.website) {
    social_score += 15
    strengths.push("Personal website adds professional credibility")
  } else {
    recommendations.push("Consider creating a personal website for additional online presence")
  }

  // Social sharing enabled (15 points)
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

  // Content Score (0-100) - Rebalanced for meaningful assessment
  let content_score = 0

  // Photos (20 points)
  const photoCount = audit_data.photo_count || 0
  if (photoCount >= 5) {
    content_score += 20
    strengths.push("Excellent photo gallery showcasing your athletic journey")
  } else if (photoCount >= 3) {
    content_score += 15
    strengths.push("Good photo collection")
  } else if (photoCount >= 1) {
    content_score += 10
    recommendations.push("Add more photos to create a comprehensive visual portfolio")
  } else {
    recommendations.push("Add photos to make your profile more engaging")
  }

  // Videos (25 points)
  const videoCount = audit_data.video_count || 0
  if (athlete.subscription_tier !== "free") {
    if (videoCount >= 3) {
      content_score += 25
      strengths.push("Great video content showcasing your athletic abilities")
    } else if (videoCount >= 1) {
      content_score += 15
      recommendations.push("Add more highlight videos to showcase different skills")
    } else {
      recommendations.push("Add highlight videos to showcase your athletic abilities")
    }
  }

  // Awards (20 points)
  const awardCount = audit_data.award_count || 0
  if (athlete.subscription_tier !== "free") {
    if (awardCount >= 3) {
      content_score += 20
      strengths.push("Documented achievements and awards")
    } else if (awardCount >= 1) {
      content_score += 12
      recommendations.push("Add more of your achievements and awards")
    } else {
      recommendations.push("Add your awards and achievements to highlight your accomplishments")
    }
  }

  // Verified Reviews (25 points) - High weight for credibility
  const verifiedCount = audit_data.verified_reviews || 0
  const totalReviews = audit_data.total_reviews || 0

  if (athlete.subscription_tier !== "free") {
    if (verifiedCount >= 3) {
      content_score += 25
      strengths.push(`${verifiedCount} verified reviews demonstrate strong coach endorsement`)
    } else if (verifiedCount >= 1) {
      content_score += 15
      strengths.push(`${verifiedCount} verified review${verifiedCount > 1 ? "s" : ""} from coaches`)
      recommendations.push("Request more verified reviews to build stronger credibility")
    } else if (totalReviews > 0) {
      content_score += 5
      recommendations.push("Request verification for your existing reviews to increase credibility")
    } else {
      recommendations.push("Request verified reviews from coaches to build credibility and trust")
    }
  }

  // Schedule/Events (10 points)
  try {
    const { data: schedule } = await supabase
      .from("athlete_schedule")
      .select("id")
      .eq("athlete_id", athlete.id)
      .gte("event_date", new Date().toISOString().split("T")[0])

    const upcomingEvents = schedule?.length || 0
    audit_data.upcoming_events = upcomingEvents

    if (upcomingEvents > 0) {
      content_score += 10
      strengths.push("Event schedule helps coaches track your activities")
    } else if (athlete.subscription_tier === "pro") {
      recommendations.push("Add your game and event schedule to keep coaches informed")
    }
  } catch (error) {
    audit_data.upcoming_events = 0
  }

  // Profile picture quality check
  if (athlete.profile_picture_url) {
    strengths.push("Professional profile picture creates a strong first impression")
  } else {
    recommendations.push("Add a professional profile picture")
  }

  // Add hero image recommendation
  if (!athlete.hero_image_url) {
    recommendations.push("Add a hero image to make your profile more visually appealing")
  }

  // Store comprehensive audit data
  audit_data.completeness_breakdown = {
    core_profile: Math.round(
      (coreFields.reduce((sum, field) => {
        const value = athlete[field.field as keyof AthleteProfile]
        return sum + (value && value !== "" ? field.points : 0)
      }, 0) /
        40) *
        100,
    ),
    athletic_details: Math.round(
      (athleticFields.reduce((sum, field) => {
        const value = athlete[field.field as keyof AthleteProfile]
        return sum + (value && (Array.isArray(value) ? value.length > 0 : value !== "") ? field.points : 0)
      }, 0) /
        20) *
        100,
    ),
    teams: audit_data.team_count > 0 ? 100 : 0,
    content_media: Math.round((contentPoints / 15) * 100),
    social_contact: Math.round((Math.min(socialPoints, 15) / 15) * 100),
  }

  return {
    completeness_score,
    seo_score: Math.round(seo_score),
    social_score,
    content_score: Math.round(content_score),
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

  // Content Score - Updated to include verified reviews
  let contentScore = 0

  // Check for photos
  const { data: photos } = await supabase.from("athlete_photos").select("id").eq("athlete_id", athleteId)

  if (photos && photos.length > 0) {
    contentScore += 20
    strengths.push(`Has ${photos.length} photos`)
  } else {
    recommendations.push("Add photos to showcase your athletic abilities")
  }

  // Check for videos
  const { data: videos } = await supabase.from("athlete_videos").select("id").eq("athlete_id", athleteId)

  if (videos && videos.length > 0) {
    contentScore += 20
    strengths.push(`Has ${videos.length} videos`)
  } else {
    recommendations.push("Add highlight videos to attract recruiters")
  }

  // Check for awards
  const { data: awards } = await supabase.from("athlete_awards").select("id").eq("athlete_id", athleteId)

  if (awards && awards.length > 0) {
    contentScore += 20
    strengths.push(`Has ${awards.length} awards listed`)
  } else {
    recommendations.push("Add your awards and achievements")
  }

  // Check for verified reviews
  const { data: allReviews } = await supabase
    .from("athlete_reviews")
    .select("id, is_verified")
    .eq("athlete_id", athleteId)

  const verifiedReviews = allReviews?.filter((review) => review.is_verified) || []
  const totalReviews = allReviews?.length || 0

  if (verifiedReviews.length > 0) {
    contentScore += 20
    strengths.push(`Has ${verifiedReviews.length} verified review${verifiedReviews.length > 1 ? "s" : ""} from coaches`)
  } else if (totalReviews > 0) {
    contentScore += 5
    recommendations.push("Request verification for your existing reviews to increase credibility")
  } else {
    recommendations.push("Request verified reviews from coaches to build credibility")
  }

  // Check for schedule - only if we haven't reached 100%
  if (contentScore < 100) {
    const { data: schedule } = await supabase.from("athlete_schedule").select("id").eq("athlete_id", athleteId)

    if (schedule && schedule.length > 0) {
      contentScore += Math.min(20, 100 - contentScore)
      strengths.push("Has upcoming events scheduled")
    } else {
      recommendations.push("Add your game/event schedule")
    }
  }

  return {
    completenessScore: Math.round(completenessScore),
    seoScore,
    socialScore: Math.round(socialScore),
    contentScore: Math.round(contentScore),
    recommendations,
    strengths,
    missingFields,
  }
}
