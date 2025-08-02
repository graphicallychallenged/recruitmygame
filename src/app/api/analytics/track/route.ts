import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

function parseUserAgent(userAgent: string) {
  // Device detection
  let deviceType = "desktop"
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = "mobile"
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = "tablet"
  }

  // Browser detection
  let browser = "unknown"
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "chrome"
  } else if (userAgent.includes("Firefox")) {
    browser = "firefox"
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "safari"
  } else if (userAgent.includes("Edg")) {
    browser = "edge"
  } else if (userAgent.includes("Opera")) {
    browser = "opera"
  }

  // OS detection
  let os = "unknown"
  if (userAgent.includes("Windows NT")) {
    os = "windows"
  } else if (userAgent.includes("Mac OS X")) {
    os = "macos"
  } else if (userAgent.includes("Linux")) {
    os = "linux"
  } else if (userAgent.includes("Android")) {
    os = "android"
  } else if (userAgent.includes("iPhone OS") || userAgent.includes("iOS")) {
    os = "ios"
  }

  return { deviceType, browser, os }
}

async function getLocationFromIP(ip: string) {
  // For testing purposes, use a real IP when in development
  const isDevelopment = process.env.NODE_ENV === "development"

  // Skip location lookup for local/private IPs (except in development mode)
  if (
    !isDevelopment &&
    (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172."))
  ) {
    return {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
    }
  }

  // In development, use a test IP for location detection
  if (isDevelopment && (ip === "127.0.0.1" || ip === "::1")) {
    console.log("Development mode: Using test IP for location detection")
    ip = "8.8.8.8" // Google's public DNS - will show Mountain View, CA
  }

  const apiKey = process.env.IPGEOLOCATION_API_KEY

  if (!apiKey) {
    console.warn("IPGEOLOCATION_API_KEY not found, falling back to ipapi.co")

    // Fallback to ipapi.co
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: {
          "User-Agent": "RecruitMyGame/1.0",
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.warn("IP geolocation error:", data.reason)
        return {
          country: "Unknown",
          city: "Unknown",
          region: "Unknown",
        }
      }

      return {
        country: data.country_name || "Unknown",
        city: data.city || "Unknown",
        region: data.region || "Unknown",
      }
    } catch (error) {
      console.warn("Failed to get location for IP:", ip, error)
      return {
        country: "Unknown",
        city: "Unknown",
        region: "Unknown",
      }
    }
  }

  try {
    // Use IPGeolocation.io API
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`, {
      headers: {
        "User-Agent": "RecruitMyGame/1.0",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Check if we got an error response
    if (data.message && data.message.includes("Invalid")) {
      console.warn("IPGeolocation API error:", data.message)
      return {
        country: "Unknown",
        city: "Unknown",
        region: "Unknown",
      }
    }

    return {
      country: data.country_name || "Unknown",
      city: data.city || "Unknown",
      region: data.state_prov || data.district || "Unknown",
    }
  } catch (error) {
    console.warn("Failed to get location for IP:", ip, error)
    return {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      athleteId,
      sessionId,
      pagePath,
      pageTitle,
      referrer,
      timeOnPage,
      totalSessionTime,
      isPageExit,
      isPeriodicUpdate,
    } = body

    if (!athleteId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle page exit or periodic update
    if (isPageExit || isPeriodicUpdate) {
      const updates: any = {
        session_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (totalSessionTime) {
        updates.total_time = totalSessionTime
      }

      const { error: exitError } = await supabase
        .from("visitor_sessions")
        .update(updates)
        .eq("session_id", sessionId)
        .eq("athlete_id", athleteId)

      if (exitError) {
        console.error("Error updating session on exit:", exitError)
      }

      // Update page view time if provided - FIX: Get UUID first
      if (timeOnPage && !isPeriodicUpdate) {
        // First get the UUID primary key from visitor_sessions
        const { data: sessionData } = await supabase
          .from("visitor_sessions")
          .select("id")
          .eq("session_id", sessionId)
          .eq("athlete_id", athleteId)
          .single()

        if (sessionData) {
          const { error: pageTimeError } = await supabase
            .from("page_views")
            .update({
              time_on_page: timeOnPage,
              updated_at: new Date().toISOString(),
            })
            .eq("session_id", sessionData.id) // Use the UUID primary key
            .eq("page_path", pagePath || "/")
            .order("viewed_at", { ascending: false })
            .limit(1)

          if (pageTimeError) {
            console.error("Error updating page time:", pageTimeError)
          }
        }
      }

      return NextResponse.json({ success: true })
    }

    // Ensure pagePath is not null or empty
    const safePath = pagePath || "/"

    // Get client info from headers
    const userAgent = request.headers.get("user-agent") || ""
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const cfConnectingIp = request.headers.get("cf-connecting-ip") // Cloudflare

    // Get the most reliable IP address
    let ip = "127.0.0.1"
    if (cfConnectingIp) {
      ip = cfConnectingIp
    } else if (forwarded) {
      ip = forwarded.split(",")[0].trim()
    } else if (realIp) {
      ip = realIp
    }

    // Parse user agent for device info
    const { deviceType, browser, os } = parseUserAgent(userAgent)

    // Check if session exists
    const { data: existingSession } = await supabase
      .from("visitor_sessions")
      .select("id, pages_visited, session_start")
      .eq("session_id", sessionId)
      .eq("athlete_id", athleteId)
      .single()

    const currentTime = new Date().toISOString()

    if (existingSession) {
      // Calculate session duration
      const sessionDuration =
        totalSessionTime || Math.floor((Date.now() - new Date(existingSession.session_start).getTime()) / 1000)

      // Update existing session
      const { error: updateError } = await supabase
        .from("visitor_sessions")
        .update({
          pages_visited: existingSession.pages_visited + 1,
          session_end: currentTime,
          total_time: sessionDuration,
          updated_at: currentTime,
        })
        .eq("id", existingSession.id)

      if (updateError) {
        console.error("Error updating session:", updateError)
      }

      // Insert page view with proper time tracking - Use UUID
      const { error: pageViewError } = await supabase.from("page_views").insert({
        athlete_id: athleteId,
        session_id: existingSession.id, // Use the UUID primary key
        page_path: safePath,
        page_title: pageTitle || null,
        referrer: referrer || null,
        time_on_page: timeOnPage || 0,
        viewed_at: currentTime,
      })

      if (pageViewError) {
        console.error("Error inserting page view:", pageViewError)
      }
    } else {
      // Get location data for new sessions
      console.log(`Getting location for IP: ${ip}`)
      const locationData = await getLocationFromIP(ip)
      console.log(`Location data:`, locationData)

      // Create new session with location data
      const { data: newSession, error: sessionError } = await supabase
        .from("visitor_sessions")
        .insert({
          athlete_id: athleteId,
          session_id: sessionId,
          visitor_ip: ip,
          user_agent: userAgent,
          referrer: referrer || null,
          country: locationData.country,
          city: locationData.city,
          device_type: deviceType,
          browser: browser,
          os: os,
          pages_visited: 1,
          session_start: currentTime,
          session_end: currentTime,
          total_time: totalSessionTime || 0,
        })
        .select("id")
        .single()

      if (sessionError) {
        console.error("Error creating session:", sessionError)
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
      }

      // Insert initial page view - Use UUID
      if (newSession) {
        const { error: pageViewError } = await supabase.from("page_views").insert({
          athlete_id: athleteId,
          session_id: newSession.id, // Use the UUID primary key
          page_path: safePath,
          page_title: pageTitle || null,
          referrer: referrer || null,
          time_on_page: timeOnPage || 0,
          viewed_at: currentTime,
        })

        if (pageViewError) {
          console.error("Error inserting page view:", pageViewError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
