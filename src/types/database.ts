export interface Database {
  public: {
    Tables: {
      athletes: {
        Row: {
          id: string
          user_id: string
          username: string
          athlete_name: string
          sport: string
          sports: string[]
          bio: string
          profile_picture_url: string
          school: string
          grade: string
          graduation_year: number
          height: string
          weight: string
          gpa: number
          sat_score: number
          act_score: number
          email?: string
          phone?: string
          show_email?: boolean
          show_phone?: boolean
          primary_color: string
          secondary_color: string
          is_public: boolean
          created_at: string
          updated_at: string
          positions_played: string[]
          location: string
          content_order: string[]
          is_profile_public: boolean
          subscription_tier: string
          theme_mode: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          athlete_name: string
          sport: string
          sports: string[]
          bio: string
          profile_picture_url: string
          school: string
          grade: string
          graduation_year: number
          height: string
          weight: string
          gpa: number
          sat_score: number
          act_score: number
          email?: string
          phone?: string
          show_email?: boolean
          show_phone?: boolean
          primary_color: string
          secondary_color: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          positions_played?: string[]
          location?: string
          content_order?: string[]
          is_profile_public?: boolean
          subscription_tier?: string
          theme_mode?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          athlete_name?: string
          sport?: string
          sports?: string[]
          bio?: string
          profile_picture_url?: string
          school?: string
          grade?: string
          graduation_year?: number
          height?: string
          weight?: string
          gpa?: number
          sat_score?: number
          act_score?: number
          email?: string
          phone?: string
          show_email?: boolean
          show_phone?: boolean
          primary_color?: string
          secondary_color?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          positions_played?: string[]
          location?: string
          content_order?: string[]
          is_profile_public?: boolean
          subscription_tier?: string
          theme_mode?: string
        }
      }
      athlete_videos: {
        Row: {
          id: string
          athlete_id: string
          title: string
          description: string
          video_url: string
          video_type: string
          thumbnail_url: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          title: string
          description: string
          video_url: string
          video_type: string
          thumbnail_url: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          title?: string
          description?: string
          video_url?: string
          video_type?: string
          thumbnail_url?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      athlete_awards: {
        Row: {
          id: string
          athlete_id: string
          title: string
          description: string
          award_type: string
          organization: string
          award_date: string
          is_public: boolean
          created_at: string
          updated_at: string
          level: string
        }
        Insert: {
          id?: string
          athlete_id: string
          title: string
          description: string
          award_type: string
          organization: string
          award_date: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          level?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          title?: string
          description?: string
          award_type?: string
          organization?: string
          award_date?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          level?: string
        }
      }
      athlete_photos: {
        Row: {
          id: string
          athlete_id: string
          photo_url: string
          caption: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          photo_url: string
          caption: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          photo_url?: string
          caption?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      athlete_schedule: {
        Row: {
          id: string
          athlete_id: string
          event_title: string
          event_date: string
          event_time: string
          location: string
          event_type: string
          description: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          event_title: string
          event_date: string
          event_time: string
          location: string
          event_type: string
          description: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          event_title?: string
          event_date?: string
          event_time?: string
          location?: string
          event_type?: string
          description?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      athlete_reviews: {
        Row: {
          id: string
          athlete_id: string
          reviewer_name: string
          reviewer_title: string
          reviewer_organization: string
          rating: number
          review_text: string
          is_verified: boolean
          is_public: boolean
          review_token?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          reviewer_name: string
          reviewer_title: string
          reviewer_organization: string
          rating: number
          review_text: string
          is_verified: boolean
          is_public?: boolean
          review_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          reviewer_name?: string
          reviewer_title?: string
          reviewer_organization?: string
          rating?: number
          review_text?: string
          is_verified?: boolean
          is_public?: boolean
          review_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          athlete_id: string
          name: string
          email: string
          message: string
          organization?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          name: string
          email: string
          message: string
          organization?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          name?: string
          email?: string
          message?: string
          organization?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          profile_visibility: string
          two_factor_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          profile_visibility?: string
          two_factor_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          profile_visibility?: string
          two_factor_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coach_review_requests: {
        Row: {
          id: string
          athlete_id: string
          coach_name: string
          coach_email: string
          coach_title?: string
          coach_organization?: string
          review_token: string
          personal_message?: string
          is_completed: boolean
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          coach_name: string
          coach_email: string
          coach_title?: string
          coach_organization?: string
          review_token?: string
          personal_message?: string
          is_completed?: boolean
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          coach_name?: string
          coach_email?: string
          coach_title?: string
          coach_organization?: string
          review_token?: string
          personal_message?: string
          is_completed?: boolean
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      business_cards: {
        Row: {
          id: string
          athlete_id: string
          card_design: string
          qr_code_url: string
          cards_generated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          card_design: string
          qr_code_url: string
          cards_generated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          card_design?: string
          qr_code_url?: string
          cards_generated?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export the Profile type correctly
export type Profile = Database["public"]["Tables"]["athletes"]["Row"]
export type Video = Database["public"]["Tables"]["athlete_videos"]["Row"]
export type Award = Database["public"]["Tables"]["athlete_awards"]["Row"]
export type Photo = Database["public"]["Tables"]["athlete_photos"]["Row"]
export type ScheduleEvent = Database["public"]["Tables"]["athlete_schedule"]["Row"]
export type Review = Database["public"]["Tables"]["athlete_reviews"]["Row"]
export type ContactSubmissionRow = Database["public"]["Tables"]["contact_submissions"]["Row"]
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]
export type CoachReviewRequest = Database["public"]["Tables"]["coach_review_requests"]["Row"]
export type BusinessCard = Database["public"]["Tables"]["business_cards"]["Row"]

export interface AthleteProfile {
  id: string
  user_id: string
  athlete_name: string
  username: string
  sport: string
  sports: string[]
  grade: string
  graduation_year: number
  school: string
  location: string
  bio: string
  height: string
  weight: string
  gpa: number
  sat_score: number
  act_score: number
  positions_played: string[]
  profile_picture_url: string
  primary_color: string
  secondary_color: string
  subscription_tier: string
  is_profile_public: boolean
  content_order: string[]
  email?: string
  phone?: string
  show_email?: boolean
  show_phone?: boolean
  created_at: string
  updated_at: string
  theme_mode: string
}

export interface AthleteVideo {
  id: string
  athlete_id: string
  title: string
  description: string
  video_url: string
  video_type: string
  thumbnail_url: string
  created_at: string
}

export interface AthletePhoto {
  id: string
  athlete_id: string
  photo_url: string
  caption: string
  created_at: string
}

export interface AthleteAward {
  id: string
  athlete_id: string
  title: string
  organization: string
  award_date: string
  award_type: string
  level: string
  description: string
  created_at: string
}

export interface AthleteSchedule {
  id: string
  athlete_id: string
  event_title: string
  event_date: string
  event_time: string
  location: string
  event_type: string
  description: string
  created_at: string
}

export interface AthleteReview {
  id: string
  athlete_id: string
  reviewer_name: string
  reviewer_title: string
  reviewer_organization: string
  rating: number
  review_text: string
  is_verified: boolean
  created_at: string
}

export interface ContactSubmission {
  id: string
  athlete_id: string
  name: string
  email: string
  organization?: string
  message: string
  created_at: string
}
