"use client"

import { useEffect, useRef, useState } from "react"
import { hasAnalyticsConsent } from "@/utils/cookieConsent"

interface AnalyticsEvent {
  event: string
  page?: string
  athlete_id?: string
  visitor_id?: string
  properties?: Record<string, any>
}

interface AnalyticsTrackerProps {
  athleteId: string
  athleteName: string
  subscriptionTier: string // Add subscription tier prop
  pagePath?: string
  pageTitle?: string
}

export function AnalyticsTracker({
  athleteId,
  athleteName,
  subscriptionTier,
  pagePath,
  pageTitle,
}: AnalyticsTrackerProps) {
  const sessionIdRef = useRef<string>()
  const sessionStartRef = useRef<number>()
  const pageStartRef = useRef<number>()
  const lastUpdateRef = useRef<number>()
  const hasTrackedInitialView = useRef(false)
  const updateIntervalRef = useRef<NodeJS.Timeout>()
  const [canTrack, setCanTrack] = useState(false)

  // Generate or get session ID
  const getSessionId = () => {
    if (!sessionIdRef.current) {
      // Try to get existing session ID from sessionStorage
      const existingSessionId = typeof window !== "undefined" ? sessionStorage.getItem("analytics_session_id") : null
      const sessionStart = typeof window !== "undefined" ? sessionStorage.getItem("analytics_session_start") : null

      // Check if session is still valid (less than 30 minutes old)
      const now = Date.now()
      const sessionAge = sessionStart ? now - Number.parseInt(sessionStart) : Number.POSITIVE_INFINITY
      const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

      if (existingSessionId && sessionAge < SESSION_TIMEOUT) {
        sessionIdRef.current = existingSessionId
        sessionStartRef.current = Number.parseInt(sessionStart!)
      } else {
        // Create new session
        sessionIdRef.current = `session_${now}_${Math.random().toString(36).substr(2, 9)}`
        sessionStartRef.current = now

        if (typeof window !== "undefined") {
          sessionStorage.setItem("analytics_session_id", sessionIdRef.current)
          sessionStorage.setItem("analytics_session_start", sessionStartRef.current.toString())
        }
      }
    }
    return sessionIdRef.current
  }

  // Check if analytics tracking is allowed
  useEffect(() => {
    const checkTrackingPermission = () => {
      // FIRST CHECK: Only PRO accounts get analytics tracking
      const isProAccount = subscriptionTier === "pro"

      if (!isProAccount) {
        console.log("Analytics tracking disabled - only available for PRO accounts")
        setCanTrack(false)
        return
      }

      // SECOND CHECK: User must consent to analytics cookies
      const hasConsent = hasAnalyticsConsent()

      // Both conditions must be true
      const canUseAnalytics = isProAccount && hasConsent
      setCanTrack(canUseAnalytics)

      console.log("Analytics tracking permission:", {
        subscriptionTier,
        isProAccount,
        hasConsent,
        canTrack: canUseAnalytics,
        athleteId,
        athleteName,
      })
    }

    checkTrackingPermission()

    // Listen for cookie preference changes
    const handlePreferencesChange = () => {
      checkTrackingPermission()
      // Reset tracking flag when preferences change
      hasTrackedInitialView.current = false
    }

    window.addEventListener("cookieConsentChanged", handlePreferencesChange)
    return () => {
      window.removeEventListener("cookieConsentChanged", handlePreferencesChange)
    }
  }, [athleteId, athleteName, subscriptionTier])

  // Track analytics data
  const trackAnalytics = async (data: any) => {
    if (!canTrack) {
      console.log("Analytics tracking skipped - either not PRO account or no analytics consent")
      return
    }

    try {
      const response = await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          subscriptionTier,
          consentGiven: true,
          trackingAllowed: canTrack,
          visitorType: "public_profile_visitor",
        }),
      })

      if (!response.ok) {
        console.error("Analytics tracking failed:", response.statusText)
      }
    } catch (error) {
      console.error("Analytics tracking error:", error)
    }
  }

  // Send analytics using sendBeacon for reliable delivery
  const sendBeacon = (data: any) => {
    if (!canTrack) {
      console.log("Analytics beacon skipped - either not PRO account or no analytics consent")
      return
    }

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob(
        [
          JSON.stringify({
            ...data,
            subscriptionTier,
            consentGiven: true,
            trackingAllowed: canTrack,
            visitorType: "public_profile_visitor",
          }),
        ],
        { type: "application/json" },
      )
      navigator.sendBeacon("/api/analytics/track", blob)
    } else {
      // Fallback to fetch for browsers without sendBeacon
      trackAnalytics(data)
    }
  }

  // Calculate session duration
  const getSessionDuration = () => {
    if (!sessionStartRef.current) return 0
    return Math.floor((Date.now() - sessionStartRef.current) / 1000)
  }

  // Calculate page duration
  const getPageDuration = () => {
    if (!pageStartRef.current) return 0
    return Math.floor((Date.now() - pageStartRef.current) / 1000)
  }

  // Send periodic updates
  const sendPeriodicUpdate = () => {
    if (!canTrack) return

    const now = Date.now()
    const sessionDuration = getSessionDuration()

    // Only send update if it's been at least 10 seconds since last update
    if (!lastUpdateRef.current || now - lastUpdateRef.current >= 10000) {
      sendBeacon({
        athleteId,
        athleteName,
        sessionId: getSessionId(),
        pagePath: pagePath || window.location.pathname,
        pageTitle: pageTitle || document.title,
        totalSessionTime: sessionDuration,
        isPeriodicUpdate: true,
      })

      lastUpdateRef.current = now
    }
  }

  // Track page exit
  const trackPageExit = () => {
    if (!canTrack) return

    const sessionDuration = getSessionDuration()
    const pageDuration = getPageDuration()

    sendBeacon({
      athleteId,
      athleteName,
      sessionId: getSessionId(),
      pagePath: pagePath || window.location.pathname,
      pageTitle: pageTitle || document.title,
      timeOnPage: pageDuration,
      totalSessionTime: sessionDuration,
      isPageExit: true,
    })
  }

  useEffect(() => {
    if (!athleteId || hasTrackedInitialView.current) return

    // Only track if this is a PRO account AND user has consented to analytics
    if (!canTrack) {
      if (subscriptionTier !== "pro") {
        console.log("Skipping analytics tracking - analytics only available for PRO accounts")
      } else {
        console.log("Skipping analytics tracking - no consent for analytics cookies")
      }
      return
    }

    const sessionId = getSessionId()
    pageStartRef.current = Date.now()

    // Track initial page view for PRO account public profile visitor
    trackAnalytics({
      athleteId,
      athleteName,
      sessionId,
      pagePath: pagePath || window.location.pathname,
      pageTitle: pageTitle || document.title,
      referrer: document.referrer || null,
      timeOnPage: 0,
      profileVisit: true,
      subscriptionTier,
    })

    hasTrackedInitialView.current = true

    // Set up periodic updates every 15 seconds
    updateIntervalRef.current = setInterval(sendPeriodicUpdate, 15000)

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (!canTrack) return

      if (document.hidden) {
        trackPageExit()
      } else {
        // Page became visible again, reset page start time
        pageStartRef.current = Date.now()
      }
    }

    // Track page unload
    const handleBeforeUnload = () => {
      if (canTrack) {
        trackPageExit()
      }
    }

    // Track page hide (more reliable than beforeunload)
    const handlePageHide = () => {
      if (canTrack) {
        trackPageExit()
      }
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("pagehide", handlePageHide)

    // Cleanup function
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("pagehide", handlePageHide)

      // Send final tracking data
      if (canTrack) {
        trackPageExit()
      }
    }
  }, [athleteId, athleteName, pagePath, pageTitle, canTrack, subscriptionTier])

  // This component renders nothing visible
  return null
}
