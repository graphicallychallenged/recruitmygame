"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { hasAnalyticsConsent } from "@/utils/cookieConsent"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface GoogleAnalyticsProps {
  trackingId: string
}

export function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  const pathname = usePathname()

  // Don't load GA on dashboard pages
  const isDashboardPage = pathname?.startsWith("/dashboard")

  if (!trackingId || isDashboardPage) {
    return null
  }

  return (
    <>
      {/* Google Analytics Scripts */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize dataLayer
          window.dataLayer = window.dataLayer || []

          // Define gtag function
          window.gtag = function gtag() {
            window.dataLayer.push(arguments)
          }

          // Configure GA
          window.gtag("js", new Date())

          // Check consent before initializing
          const hasConsent = hasAnalyticsConsent()

          window.gtag("config", trackingId, {
            page_title: document.title,
            page_location: window.location.href,
            anonymize_ip: true,
            allow_google_signals: hasConsent,
            allow_ad_personalization_signals: hasConsent,
          })

          console.log("Google Analytics initialized:", {
            trackingId,
            hasConsent,
            page: window.location.pathname,
          })
        }}
      />

      <GoogleAnalyticsTracker trackingId={trackingId} />
    </>
  )
}

function GoogleAnalyticsTracker({ trackingId }: { trackingId: string }) {
  const pathname = usePathname()

  // Track page views
  useEffect(() => {
    if (!hasAnalyticsConsent() || !window.gtag) {
      console.log("GA page view skipped - no consent or GA not loaded")
      return
    }

    // Track page view
    window.gtag("config", trackingId, {
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    })

    console.log("GA page view tracked:", pathname)
  }, [pathname, trackingId])

  // Handle consent changes
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent) => {
      const consent = event.detail

      if (!window.gtag) return

      if (consent.analytics) {
        // Grant consent
        window.gtag("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "granted",
        })

        // Re-track current page
        window.gtag("config", trackingId, {
          page_path: pathname,
          page_title: document.title,
          page_location: window.location.href,
        })

        console.log("GA consent granted - tracking enabled")
      } else {
        // Deny consent
        window.gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
        })

        console.log("GA consent denied - tracking disabled")
      }
    }

    window.addEventListener("cookieConsentChanged", handleConsentChange as EventListener)

    return () => {
      window.removeEventListener("cookieConsentChanged", handleConsentChange as EventListener)
    }
  }, [trackingId, pathname])

  return null
}

// Utility functions for manual event tracking
export function trackGAEvent(eventName: string, parameters?: Record<string, any>) {
  if (!hasAnalyticsConsent() || !window.gtag) {
    console.log("GA event tracking skipped - no consent or GA not loaded")
    return
  }

  window.gtag("event", eventName, {
    event_category: "engagement",
    event_label: window.location.pathname,
    ...parameters,
  })

  console.log("GA event tracked:", eventName, parameters)
}

export function trackGAConversion(conversionId: string, parameters?: Record<string, any>) {
  if (!hasAnalyticsConsent() || !window.gtag) {
    console.log("GA conversion tracking skipped - no consent or GA not loaded")
    return
  }

  window.gtag("event", "conversion", {
    send_to: conversionId,
    ...parameters,
  })

  console.log("GA conversion tracked:", conversionId, parameters)
}

export function setGAUserId(userId: string) {
  if (!hasAnalyticsConsent() || !window.gtag) {
    console.log("GA user ID setting skipped - no consent or GA not loaded")
    return
  }

  window.gtag("config", "GA_MEASUREMENT_ID", {
    user_id: userId,
  })

  console.log("GA user ID set:", userId)
}
