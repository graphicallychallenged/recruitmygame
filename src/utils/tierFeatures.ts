export type SubscriptionTier = "free" | "premium" | "pro"

export interface TierFeatures {
  videos: number
  photos: number
  awards: boolean
  schedule: boolean
  reviews: boolean
  business_cards: boolean
  verified_reviews: boolean
  multiple_sports: boolean
  analytics: boolean
  custom_branding: boolean
  priority_support: boolean
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    videos: 3,
    photos: 10,
    awards: true,
    schedule: false,
    reviews: false,
    business_cards: false,
    verified_reviews: false,
    multiple_sports: false,
    analytics: false,
    custom_branding: false,
    priority_support: false,
  },
  premium: {
    videos: 10,
    photos: 50,
    awards: true,
    schedule: true,
    reviews: true,
    business_cards: false,
    verified_reviews: false,
    multiple_sports: false,
    analytics: true,
    custom_branding: true,
    priority_support: false,
  },
  pro: {
    videos: 999, // Unlimited
    photos: 999, // Unlimited
    awards: true,
    schedule: true,
    reviews: true,
    business_cards: true,
    verified_reviews: true,
    multiple_sports: true,
    analytics: true,
    custom_branding: true,
    priority_support: true,
  },
}

export function hasFeature(tier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  const value = TIER_FEATURES[tier][feature]
  return typeof value === "boolean" ? value : true
}

export function getFeatureLimit(tier: SubscriptionTier, feature: "videos" | "photos"): number {
  return TIER_FEATURES[tier][feature] as number
}

export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case "free":
      return "gray"
    case "premium":
      return "blue"
    case "pro":
      return "purple"
    default:
      return "gray"
  }
}

export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case "free":
      return "Free"
    case "premium":
      return "Premium"
    case "pro":
      return "Pro"
    default:
      return "Free"
  }
}

export function getRequiredTier(feature: keyof TierFeatures): SubscriptionTier {
  if (TIER_FEATURES.free[feature]) return "free"
  if (TIER_FEATURES.premium[feature]) return "premium"
  return "pro"
}

export function canAccessFeature(userTier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  return hasFeature(userTier, feature)
}
