export interface CookieConsent {
  essential: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: number
}

export const COOKIE_CONSENT_KEY = "rmg_cookie_consent"
export const COOKIE_BANNER_DISMISSED_KEY = "rmg_banner_dismissed"

export const defaultConsent: CookieConsent = {
  essential: true, // Always true - required for basic functionality
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: Date.now(),
}

export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return defaultConsent

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) return defaultConsent

    const parsed = JSON.parse(stored)
    return {
      ...defaultConsent,
      ...parsed,
      essential: true, // Always ensure essential is true
    }
  } catch {
    return defaultConsent
  }
}

export function setCookieConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === "undefined") return

  const newConsent: CookieConsent = {
    ...getCookieConsent(),
    ...consent,
    essential: true, // Always ensure essential is true
    timestamp: Date.now(),
  }

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent))

  // Dispatch custom event for components to listen to
  window.dispatchEvent(
    new CustomEvent("cookieConsentChanged", {
      detail: newConsent,
    }),
  )
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent().analytics
}

export function hasMarketingConsent(): boolean {
  return getCookieConsent().marketing
}

export function isBannerDismissed(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(COOKIE_BANNER_DISMISSED_KEY) === "true"
}

export function setBannerDismissed(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(COOKIE_BANNER_DISMISSED_KEY, "true")
}

export function resetCookieConsent(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(COOKIE_CONSENT_KEY)
  localStorage.removeItem(COOKIE_BANNER_DISMISSED_KEY)
}

// Export the class-based manager for backward compatibility
export class CookieConsentManager {
  static hasConsent(): boolean {
    return !isBannerDismissed() || getCookieConsent().analytics || getCookieConsent().marketing
  }

  static getPreferences(): CookieConsent {
    return getCookieConsent()
  }

  static setPreferences(preferences: Partial<CookieConsent>): void {
    setCookieConsent(preferences)
    setBannerDismissed()
  }

  static acceptAll(): void {
    this.setPreferences({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    })
  }

  static acceptEssentialOnly(): void {
    this.setPreferences(defaultConsent)
  }

  static canUseAnalytics(): boolean {
    return hasAnalyticsConsent()
  }

  static canUseMarketing(): boolean {
    return hasMarketingConsent()
  }

  static canUseFunctional(): boolean {
    return getCookieConsent().preferences
  }

  static resetConsent(): void {
    resetCookieConsent()
  }
}
