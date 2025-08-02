import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

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

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get page views for the time period
    const { data: pageViews, error: pageViewsError } = await supabase
      .from("page_views")
      .select("*")
      .eq("athlete_id", athlete.id)
      .gte("viewed_at", startDate.toISOString())
      .order("viewed_at", { ascending: false })

    if (pageViewsError) {
      console.error("Page views error:", pageViewsError)
      return NextResponse.json({ error: "Failed to fetch page views" }, { status: 500 })
    }

    // Get visitor sessions for the time period
    const { data: sessions, error: sessionsError } = await supabase
      .from("visitor_sessions")
      .select("*")
      .eq("athlete_id", athlete.id)
      .gte("session_start", startDate.toISOString())
      .order("session_start", { ascending: false })

    if (sessionsError) {
      console.error("Sessions error:", sessionsError)
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }

    // Calculate daily analytics
    const dailyAnalytics = new Map()

    // Process page views by date
    pageViews?.forEach((view) => {
      const date = new Date(view.viewed_at).toISOString().split("T")[0]
      if (!dailyAnalytics.has(date)) {
        dailyAnalytics.set(date, {
          date,
          page_views: 0,
          unique_visitors: new Set(),
          sessions: new Set(),
          total_session_time: 0,
          session_count: 0,
        })
      }
      const dayData = dailyAnalytics.get(date)
      dayData.page_views++
    })

    // Process sessions by date
    sessions?.forEach((session) => {
      const date = new Date(session.session_start).toISOString().split("T")[0]
      if (!dailyAnalytics.has(date)) {
        dailyAnalytics.set(date, {
          date,
          page_views: 0,
          unique_visitors: new Set(),
          sessions: new Set(),
          total_session_time: 0,
          session_count: 0,
        })
      }
      const dayData = dailyAnalytics.get(date)
      dayData.unique_visitors.add(session.session_id)
      dayData.sessions.add(session.session_id)

      // Add session time if available
      if (session.total_time && session.total_time > 0) {
        dayData.total_session_time += session.total_time
        dayData.session_count++
      }
    })

    // Convert to array and calculate final metrics
    const analytics = Array.from(dailyAnalytics.values())
      .map((day) => {
        const avgSessionDuration = day.session_count > 0 ? Math.round(day.total_session_time / day.session_count) : 0
        const bounceRate = 0 // Calculate this based on single-page sessions

        return {
          date: day.date,
          page_views: day.page_views,
          unique_visitors: day.unique_visitors.size,
          bounce_rate: bounceRate,
          avg_session_duration: avgSessionDuration,
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate bounce rate for each day
    const sessionsByDate = new Map()
    sessions?.forEach((session) => {
      const date = new Date(session.session_start).toISOString().split("T")[0]
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, [])
      }
      sessionsByDate.get(date).push(session)
    })

    analytics.forEach((day) => {
      const daySessions = sessionsByDate.get(day.date) || []
      if (daySessions.length > 0) {
        const bounces = daySessions.filter((s) => s.pages_visited === 1).length
        day.bounce_rate = Math.round((bounces / daySessions.length) * 100)
      }
    })

    // Calculate overall metrics
    const totalSessions = sessions?.length || 0
    const totalPageViews = pageViews?.length || 0
    const uniqueVisitors = new Set(sessions?.map((s) => s.session_id)).size || 0

    // Calculate average session duration from all sessions with time data
    const sessionsWithTime = sessions?.filter((s) => s.total_time && s.total_time > 0) || []
    const avgSessionDuration =
      sessionsWithTime.length > 0
        ? Math.round(sessionsWithTime.reduce((sum, s) => sum + s.total_time, 0) / sessionsWithTime.length)
        : 0

    // Calculate bounce rate
    const singlePageSessions = sessions?.filter((s) => s.pages_visited === 1).length || 0
    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0

    return NextResponse.json({
      analytics: analytics || [],
      sessions: sessions || [],
      pageViews: pageViews || [],
      totalViews: totalPageViews,
      totalSessions,
      totalVisitors: uniqueVisitors,
      avgSessionDuration,
      bounceRate,
    })
  } catch (error) {
    console.error("Analytics data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
