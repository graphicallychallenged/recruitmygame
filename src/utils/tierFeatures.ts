export type SubscriptionTier = "free" | "premium" | "pro"

export interface TierFeatures {
  photos: number // max photos
  videos: number // max videos
  awards: boolean // can add awards
  schedule: boolean // can add schedule
  reviews: boolean // can receive reviews
  teams: boolean // can add teams
  custom_theming: boolean // custom colors and themes
  analytics: boolean // advanced analytics
  business_cards: boolean // business card generation
  multiple_sports: boolean // can add multiple sports
  custom_hero: boolean // custom hero image
  priority_support: boolean // priority customer support
  custom_subdomain:boolean
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    photos: 5,
    videos: 0,
    awards: false,
    schedule: false,
    reviews: false,
    teams: true, // Available for all tiers
    custom_theming: false,
    analytics: false,
    business_cards: false,
    multiple_sports: false,
    custom_hero: false,
    priority_support: false,
      custom_subdomain:false
  },
  premium: {
    photos: 20,
    videos: 5,
    awards: true,
    schedule: true,
    reviews: true,
    teams: true, // Available for all tiers
    custom_theming: true,
    analytics: false,
    business_cards: false,
    multiple_sports: false,
    custom_hero: false,
    priority_support: false,
      custom_subdomain:false
  },
  pro: {
    photos: 999, // unlimited
    videos: 999, // unlimited
    awards: true,
    schedule: true,
    reviews: true,
    teams: true, // Available for all tiers
    custom_theming: true,
    analytics: true,
    business_cards: true,
    multiple_sports: true,
    custom_hero: true,
    priority_support: true,
    custom_subdomain:true
  },
}

export function getSubscriptionLimits(tier: SubscriptionTier): TierFeatures {
  return TIER_FEATURES[tier] || TIER_FEATURES.free
}

export function hasFeature(tier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  const features = getSubscriptionLimits(tier)
  return Boolean(features[feature])
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

export function canUpgradeFrom(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  const tierOrder = { free: 0, premium: 1, pro: 2 }
  return tierOrder[targetTier] > tierOrder[currentTier]
}
