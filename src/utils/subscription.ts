export type SubscriptionTier = "free" | "premium" | "pro"

export interface SubscriptionLimits {
  videos: number
  photos: number
  customization: boolean
  analytics: boolean
  priority_support: boolean
  custom_domain: boolean
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    videos: 3,
    photos: 10,
    customization: false,
    analytics: false,
    priority_support: false,
    custom_domain: false,
  },
  premium: {
    videos: 10,
    photos: 50,
    customization: true,
    analytics: true,
    priority_support: false,
    custom_domain: false,
  },
  pro: {
    videos: 25,
    photos: 100,
    customization: true,
    analytics: true,
    priority_support: true,
    custom_domain: true,
  },
}

export const SUBSCRIPTION_PRICES = {
  premium: { monthly: 9.99, yearly: 99.99 },
  pro: { monthly: 19.99, yearly: 199.99 },
}

export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier]
}

export function canUploadMore(currentCount: number, tier: SubscriptionTier, type: "videos" | "photos"): boolean {
  const limits = getSubscriptionLimits(tier)
  return currentCount < limits[type]
}

export function getUpgradeMessage(tier: SubscriptionTier, type: "videos" | "photos"): string {
  const nextTier = tier === "free" ? "premium" : "pro"
  const nextLimits = getSubscriptionLimits(nextTier as SubscriptionTier)

  return `Upgrade to ${nextTier.toUpperCase()} to upload up to ${nextLimits[type]} ${type}.`
}
