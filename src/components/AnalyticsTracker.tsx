"use client"

import { useEffect, useRef } from "react"

interface AnalyticsTrackerProps {
  athleteId: string
  athleteName: string
}

export function AnalyticsTracker({ athleteId, athleteName }: AnalyticsTrackerProps) {
  const sessionStartTime = useRef<number>(Date.now())
  const pageStartTime = useRef<number>(Date.now())
  const sessionId = useRef<string>("")
  const hasTrackedInitialView = useRef<boolean>(false)

  useEffect(() => {
    if (typeof window === "undefined" || !athleteId) return

    // Generate or get session ID
    let storedSessionId = sessionStorage.getItem("rmg_session_id")
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("rmg_session_id", storedSessionId)
      sessionStorage.setItem("rmg_session_start", Date.now().toString())
      sessionStartTime.current = Date.now()
    } else {
      const storedStartTime = sessionStorage.getItem("rmg_session_start")
      if (storedStartTime) {
        sessionStartTime.current = Number.parseInt(storedStartTime)
      }
    }
    sessionId.current = storedSessionId

    // Track initial page view
    const trackInitialView = async () => {
      if (hasTrackedInitialView.current) return
      hasTrackedInitialView.current = true

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId,
            sessionId: sessionId.current,
            pagePath: window.location.pathname,
            pageTitle: document.title,
            referrer: document.referrer,
            timeOnPage: 0,
            isPageExit: false,
          }),
        })
      } catch (error) {
        console.debug("Analytics tracking failed:", error)
      }
    }

    trackInitialView()

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackPageExit()
      } else if (document.visibilityState === "visible") {
        pageStartTime.current = Date.now()
      }
    }

    // Track when user leaves the page
    const trackPageExit = async () => {
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000)
      const totalSessionTime = Math.floor((Date.now() - sessionStartTime.current) / 1000)

      try {
        // Use sendBeacon for reliable tracking on page exit
        const data = JSON.stringify({
          athleteId,
          sessionId: sessionId.current,
          pagePath: window.location.pathname,
          pageTitle: document.title,
          timeOnPage,
          totalSessionTime,
          isPageExit: true,
        })

        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/analytics/track", data)
        } else {
          // Fallback for browsers without sendBeacon
          await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data,
            keepalive: true,
          })
        }
      } catch (error) {
        console.debug("Analytics exit tracking failed:", error)
      }
    }

    // Track periodic updates (every 30 seconds)
    const trackPeriodicUpdate = async () => {
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000)
      const totalSessionTime = Math.floor((Date.now() - sessionStartTime.current) / 1000)

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId,
            sessionId: sessionId.current,
            pagePath: window.location.pathname,
            pageTitle: document.title,
            timeOnPage,
            totalSessionTime,
            isPageExit: false,
            isPeriodicUpdate: true,
          }),
        })
      } catch (error) {
        console.debug("Analytics periodic update failed:", error)
      }
    }

    // Set up event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", trackPageExit)
    window.addEventListener("pagehide", trackPageExit)

    // Set up periodic tracking (every 30 seconds)
    const periodicInterval = setInterval(trackPeriodicUpdate, 30000)

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", trackPageExit)
      window.removeEventListener("pagehide", trackPageExit)
      clearInterval(periodicInterval)

      // Track final exit
      trackPageExit()
    }
  }, [athleteId, athleteName])

  // This component doesn't render anything visible
  return null
}
