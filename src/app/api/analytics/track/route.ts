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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { athleteId, sessionId, pagePath, pageTitle, referrer } = body

    if (!athleteId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure pagePath is not null or empty
    const safePath = pagePath || "/"

    // Get client info from headers
    const userAgent = request.headers.get("user-agent") || ""
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "127.0.0.1"

    // Parse user agent for real device info
    const { deviceType, browser, os } = parseUserAgent(userAgent)

    // Check if session exists
    const { data: existingSession } = await supabase
      .from("visitor_sessions")
      .select("id, pages_visited, session_start")
      .eq("session_id", sessionId)
      .eq("athlete_id", athleteId)
      .single()

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from("visitor_sessions")
        .update({
          pages_visited: existingSession.pages_visited + 1,
          session_end: new Date().toISOString(),
          total_time: Math.floor((Date.now() - new Date(existingSession.session_start).getTime()) / 1000),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSession.id)

      if (updateError) {
        console.error("Error updating session:", updateError)
      }

      // Insert page view with viewed_at timestamp
      const { error: pageViewError } = await supabase.from("page_views").insert({
        athlete_id: athleteId,
        session_id: existingSession.id,
        page_path: safePath,
        page_title: pageTitle || null,
        referrer: referrer || null,
        viewed_at: new Date().toISOString(),
      })

      if (pageViewError) {
        console.error("Error inserting page view:", pageViewError)
      }
    } else {
      // Create new session with real device info
      const { data: newSession, error: sessionError } = await supabase
        .from("visitor_sessions")
        .insert({
          athlete_id: athleteId,
          session_id: sessionId,
          visitor_ip: ip,
          user_agent: userAgent,
          referrer: referrer || null,
          device_type: deviceType,
          browser: browser,
          os: os,
          pages_visited: 1,
          session_start: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (sessionError) {
        console.error("Error creating session:", sessionError)
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
      }

      // Insert page view with viewed_at timestamp
      if (newSession) {
        const { error: pageViewError } = await supabase.from("page_views").insert({
          athlete_id: athleteId,
          session_id: newSession.id,
          page_path: safePath,
          page_title: pageTitle || null,
          referrer: referrer || null,
          viewed_at: new Date().toISOString(),
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
