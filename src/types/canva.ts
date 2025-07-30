export interface CardDesign {
  id: string
  name: string
  preview_url: string
  description: string
  canva_template_id: string
  created_at?: string
}

export interface CardOptions {
  includeEmail: boolean
  includePhone: boolean
  includeQR: boolean
  includePhoto: boolean
}

export interface AthleteCardData {
  athlete_name: string
  sport: string
  school?: string
  location?: string
  username: string
  profile_picture_url?: string
  primary_color?: string
  secondary_color?: string
  email?: string
  phone?: string
}

export type SubscriptionTier = "free" | "premium" | "pro"
