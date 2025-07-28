export type SubscriptionTier = "free" | "premium" | "pro"

export interface TierFeatures {
  photos: number
  videos: number
  awards: boolean
  schedule: boolean
  reviews: boolean
  business_cards: boolean
  coach_reviews: boolean
  analytics: boolean
  custom_domain: boolean
  priority_support: boolean
  verified_reviews: boolean
  multiple_sports: boolean
  custom_theming: boolean
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    photos: 5,
    videos: 0,
    awards: false,
    schedule: false,
    reviews: false,
    business_cards: false,
    coach_reviews: false,
    analytics: false,
    custom_domain: false,
    priority_support: false,
    verified_reviews: false,
    multiple_sports: false,
    custom_theming: false,
  },
  premium: {
    photos: 15,
    videos: 5,
    awards: true,
    schedule: false,
    reviews: true,
    business_cards: false,
    coach_reviews: true,
    analytics: false,
    custom_domain: false,
    priority_support: false,
    verified_reviews: false,
    multiple_sports: false,
    custom_theming: true,
  },
  pro: {
    photos: 999, // unlimited
    videos: 999, // unlimited
    awards: true,
    schedule: true,
    reviews: true,
    business_cards: true,
    coach_reviews: true,
    analytics: true,
    custom_domain: true,
    priority_support: true,
    verified_reviews: true,
    multiple_sports: true,
    custom_theming: true,
  },
}

export function hasFeature(tier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  return TIER_FEATURES[tier][feature] === true
}

export function getFeatureLimit(tier: SubscriptionTier, feature: "photos" | "videos"): number {
  return TIER_FEATURES[tier][feature] as number
}

export function getSubscriptionLimits(tier: SubscriptionTier): TierFeatures {
  return TIER_FEATURES[tier]
}

export function canUploadMore(currentCount: number, tier: SubscriptionTier, type: "photos" | "videos"): boolean {
  const limit = getFeatureLimit(tier, type)
  if (limit >= 999) return true // unlimited
  return currentCount < limit
}

export function getUpgradeMessage(tier: SubscriptionTier, type: string): string {
  if (tier === "free") {
    return `Upgrade to Premium to add more ${type} and unlock additional features.`
  }
  if (tier === "premium") {
    return `Upgrade to Pro to get unlimited ${type} and premium features.`
  }
  return `You've reached your ${type} limit.`
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

export function filterContentByTier<T extends { is_public?: boolean }>(
  content: T[],
  tier: SubscriptionTier,
  isOwner = false,
): T[] {
  // If user is the owner, show all content
  if (isOwner) {
    return content
  }

  // For public viewing, only show public content
  return content.filter((item) => item.is_public !== false)
}
