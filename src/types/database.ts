export interface AthleteProfile {
  id: string
  user_id: string
  username: string
  athlete_name: string
  sport: string
  positions_played?: string[]
  grade?: string
  graduation_year?: number
  height?: string
  weight?: string
  gpa?: number
  bio?: string
  profile_picture_url?: string
  is_public: boolean
  primary_color?: string
  secondary_color?: string
  location?: string
  school?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface AthleteVideo {
  id: string
  athlete_id: string
  title: string
  description?: string
  video_url: string
  video_type: "youtube" | "upload"
  thumbnail_url?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AthletePhoto {
  id: string
  athlete_id: string
  photo_url: string
  caption?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AthleteAward {
  id: string
  athlete_id: string
  title: string
  organization?: string
  award_date: string
  award_type: string
  level?: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AthleteSchedule {
  id: string
  athlete_id: string
  event_title: string
  event_date: string
  event_time?: string
  location?: string
  event_type: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AthleteReview {
  id: string
  athlete_id: string
  reviewer_name: string
  reviewer_title?: string
  reviewer_organization?: string
  rating: number
  review_text: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ContactSubmission {
  id: string
  athlete_id: string
  name: string
  email: string
  organization?: string
  message: string
  created_at: string
  updated_at: string
}
