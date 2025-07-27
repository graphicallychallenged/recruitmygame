export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      athletes: {
        Row: {
          id: string
          user_id: string
          athlete_name: string
          username: string
          sport: string
          sports: string[] | null
          grade: string | null
          graduation_year: number | null
          school: string | null
          location: string | null
          bio: string | null
          height: string | null
          weight: string | null
          gpa: number | null
          sat_score: number | null
          act_score: number | null
          positions_played: string[] | null
          profile_picture_url: string | null
          primary_color: string | null
          secondary_color: string | null
          subscription_tier: string
          is_profile_public: boolean | null
          content_order: string[] | null
          email: string | null
          phone: string | null
          show_email: boolean | null
          show_phone: boolean | null
          theme_mode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          athlete_name: string
          username: string
          sport: string
          sports?: string[] | null
          grade?: string | null
          graduation_year?: number | null
          school?: string | null
          location?: string | null
          bio?: string | null
          height?: string | null
          weight?: string | null
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          positions_played?: string[] | null
          profile_picture_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          subscription_tier?: string
          is_profile_public?: boolean | null
          content_order?: string[] | null
          email?: string | null
          phone?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          theme_mode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          athlete_name?: string
          username?: string
          sport?: string
          sports?: string[] | null
          grade?: string | null
          graduation_year?: number | null
          school?: string | null
          location?: string | null
          bio?: string | null
          height?: string | null
          weight?: string | null
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          positions_played?: string[] | null
          profile_picture_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          subscription_tier?: string
          is_profile_public?: boolean | null
          content_order?: string[] | null
          email?: string | null
          phone?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          theme_mode?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      athlete_awards: {
        Row: {
          id: string
          athlete_id: string
          title: string
          organization: string | null
          award_date: string
          award_type: string
          level: string | null
          description: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          title: string
          organization?: string | null
          award_date: string
          award_type: string
          level?: string | null
          description?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          title?: string
          organization?: string | null
          award_date?: string
          award_type?: string
          level?: string | null
          description?: string | null
          is_public?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_awards_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_photos: {
        Row: {
          id: string
          athlete_id: string
          photo_url: string
          caption: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          photo_url: string
          caption?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          photo_url?: string
          caption?: string | null
          is_public?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_photos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_reviews: {
        Row: {
          id: string
          athlete_id: string
          reviewer_name: string
          reviewer_title: string
          reviewer_organization: string
          reviewer_email: string | null
          reviewer_phone: string | null
          reviewer_image_url: string | null
          review_text: string
          review_type: string
          rating: number
          relationship_duration: string | null
          can_contact_reviewer: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          reviewer_name: string
          reviewer_title: string
          reviewer_organization: string
          reviewer_email?: string | null
          reviewer_phone?: string | null
          reviewer_image_url?: string | null
          review_text: string
          review_type: string
          rating: number
          relationship_duration?: string | null
          can_contact_reviewer?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          reviewer_name?: string
          reviewer_title?: string
          reviewer_organization?: string
          reviewer_email?: string | null
          reviewer_phone?: string | null
          reviewer_image_url?: string | null
          review_text?: string
          review_type?: string
          rating?: number
          relationship_duration?: string | null
          can_contact_reviewer?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_reviews_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_schedule: {
        Row: {
          id: string
          athlete_id: string
          event_name: string
          event_date: string
          event_time: string | null
          location: string | null
          event_type: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          event_name: string
          event_date: string
          event_time?: string | null
          location?: string | null
          event_type: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          event_name?: string
          event_date?: string
          event_time?: string | null
          location?: string | null
          event_type?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_schedule_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_videos: {
        Row: {
          id: string
          athlete_id: string
          title: string
          description: string | null
          video_url: string
          video_type: string
          thumbnail_url: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          title: string
          description?: string | null
          video_url: string
          video_type: string
          thumbnail_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          title?: string
          description?: string | null
          video_url?: string
          video_type?: string
          thumbnail_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_videos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          id: string
          athlete_id: string
          name: string
          email: string
          organization: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          name: string
          email: string
          organization?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          name?: string
          email?: string
          organization?: string | null
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_contact_messages: {
        Row: {
          id: string
          review_id: string
          athlete_id: string
          sender_name: string
          sender_email: string
          sender_organization: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          athlete_id: string
          sender_name: string
          sender_email: string
          sender_organization?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          athlete_id?: string
          sender_name?: string
          sender_email?: string
          sender_organization?: string | null
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_contact_messages_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "athlete_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviewer_contact_messages_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Derived types for easier use
export type AthleteProfile = {
  id: string
  user_id: string
  athlete_name: string
  username: string
  sport: string
  sports: string[] | null
  grade: string | null
  graduation_year: number | null
  school: string | null
  location: string | null
  bio: string | null
  height: string | null
  weight: string | null
  gpa: number | null
  sat_score: number | null
  act_score: number | null
  positions_played: string[] | null
  profile_picture_url: string | null
  primary_color: string | null
  secondary_color: string | null
  subscription_tier: string
  is_profile_public: boolean | null
  content_order: string[] | null
  email: string | null
  phone: string | null
  show_email: boolean | null
  show_phone: boolean | null
  theme_mode: string | null
  created_at: string
  updated_at: string
}

export type AthletePhoto = {
  id: string
  athlete_id: string
  photo_url: string
  caption: string | null
  is_public: boolean
  created_at: string
}

export type AthleteVideo = {
  id: string
  athlete_id: string
  title: string
  description: string | null
  video_url: string
  video_type: string
  thumbnail_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type AthleteAward = {
  id: string
  athlete_id: string
  title: string
  organization: string | null
  award_date: string
  award_type: string
  level: string | null
  description: string | null
  is_public: boolean
  created_at: string
}

export type AthleteSchedule = {
  id: string
  athlete_id: string
  event_name: string
  event_date: string
  event_time: string | null
  location: string | null
  event_type: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type AthleteReview = {
  id: string
  athlete_id: string
  reviewer_name: string
  reviewer_title: string
  reviewer_organization: string
  reviewer_email: string | null
  reviewer_phone: string | null
  reviewer_image_url: string | null
  review_text: string
  review_type: string
  rating: number
  relationship_duration: string | null
  can_contact_reviewer: boolean
  created_at: string
  updated_at: string
}

export type ContactSubmission = {
  id: string
  athlete_id: string
  name: string
  email: string
  organization: string | null
  message: string
  created_at: string
}

export type ReviewerContactMessage = {
  id: string
  review_id: string
  athlete_id: string
  sender_name: string
  sender_email: string
  sender_organization: string | null
  message: string
  created_at: string
}
