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
          subdomain: string | null
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
          positions_played: string | null
          sport_positions: Json | null
          dominant_foot: string | null
          dominant_hand: string | null
          profile_picture_url: string | null
          primary_color: string | null
          secondary_color: string | null
          subscription_tier: string
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          is_profile_public: boolean | null
          content_order: string[] | null
          email: string | null
          phone: string | null
          show_email: boolean | null
          show_phone: boolean | null
          theme_mode: string | null
          created_at: string
          updated_at: string
          hero_image_url: string | null
          default_hero_gender: string | null
          instagram: string | null
          twitter: string | null
          tiktok: string | null
          facebook: string | null
          youtube: string | null
          linkedin: string | null
          website: string | null
          maxpreps_url: string | null
          ncsa_url: string | null
          other_recruiting_profiles: Json | null
          profile_visibility: "public" | "private"
          allow_coach_reviews: boolean | null
          show_location: boolean | null
          allow_profile_notifications: boolean | null
          follower_count: number | null
          enable_social_sharing: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          athlete_name: string
          username: string
          subdomain?: string | null
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
          positions_played?: string | null
          sport_positions?: Json | null
          dominant_foot?: string | null
          dominant_hand?: string | null
          profile_picture_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          subscription_tier?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          is_profile_public?: boolean | null
          content_order?: string[] | null
          email?: string | null
          phone?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          theme_mode?: string | null
          created_at?: string
          updated_at?: string
          hero_image_url?: string | null
          default_hero_gender?: string | null
          instagram?: string
          twitter?: string
          tiktok?: string
          facebook?: string
          youtube?: string
          linkedin?: string
          website?: string
          maxpreps_url?: string
          ncsa_url?: string
          other_recruiting_profiles?: Json
          profile_visibility?: "public" | "private"
          allow_coach_reviews?: boolean | null
          show_location?: boolean | null
          allow_profile_notifications?: boolean | null
          follower_count?: number | null
          enable_social_sharing?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          athlete_name?: string
          username?: string
          subdomain?: string | null
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
          positions_played?: string | null
          sport_positions?: Json | null
          dominant_foot?: string | null
          dominant_hand?: string | null
          profile_picture_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          subscription_tier?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          is_profile_public?: boolean | null
          content_order?: string[] | null
          email?: string | null
          phone?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          theme_mode?: string | null
          created_at?: string
          updated_at?: string
          hero_image_url?: string | null
          default_hero_gender?: string | null
          instagram?: string
          twitter?: string
          tiktok?: string
          facebook?: string
          youtube?: string
          linkedin?: string
          website?: string
          maxpreps_url?: string
          ncsa_url?: string
          other_recruiting_profiles?: Json
          profile_visibility?: "public" | "private"
          allow_coach_reviews?: boolean | null
          show_location?: boolean | null
          allow_profile_notifications?: boolean | null
          follower_count?: number | null
          enable_social_sharing?: boolean | null
        }
        Relationships: []
      }
      profile_analytics: {
        Row: {
          id: string
          athlete_id: string
          date: string
          page_views: number
          unique_visitors: number
          bounce_rate: number
          avg_session_duration: number
          referrer_data: Json
          device_data: Json
          location_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          date: string
          page_views?: number
          unique_visitors?: number
          bounce_rate?: number
          avg_session_duration?: number
          referrer_data?: Json
          device_data?: Json
          location_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          date?: string
          page_views?: number
          unique_visitors?: number
          bounce_rate?: number
          avg_session_duration?: number
          referrer_data?: Json
          device_data?: Json
          location_data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_analytics_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_audits: {
        Row: {
          id: string
          athlete_id: string
          audit_date: string
          completeness_score: number
          seo_score: number
          social_score: number
          content_score: number
          recommendations: Json
          missing_fields: Json
          strengths: Json
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          audit_date?: string
          completeness_score: number
          seo_score: number
          social_score: number
          content_score: number
          recommendations?: Json
          missing_fields?: Json
          strengths?: Json
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          audit_date?: string
          completeness_score?: number
          seo_score?: number
          social_score?: number
          content_score?: number
          recommendations?: Json
          missing_fields?: Json
          strengths?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_audits_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_sessions: {
        Row: {
          id: string
          athlete_id: string
          session_id: string
          visitor_ip: string | null
          user_agent: string | null
          referrer: string | null
          country: string | null
          city: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          pages_visited: Json
          session_start: string
          session_end: string | null
          total_time: number
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          session_id: string
          visitor_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          pages_visited?: Json
          session_start?: string
          session_end?: string | null
          total_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          session_id?: string
          visitor_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          pages_visited?: Json
          session_start?: string
          session_end?: string | null
          total_time?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_sessions_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          id: string
          athlete_id: string
          session_id: string | null
          page_path: string
          page_title: string | null
          view_time: string
          time_on_page: number
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          session_id?: string | null
          page_path: string
          page_title?: string | null
          view_time?: string
          time_on_page?: number
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          session_id?: string | null
          page_path?: string
          page_title?: string | null
          view_time?: string
          time_on_page?: number
          referrer?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_views_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_awards: {
        Row: {
          id: string
          athlete_id: string
          award_name: string
          award_type: string
          date_received: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          award_name: string
          award_type: string
          date_received: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          award_name?: string
          award_type?: string
          date_received?: string
          description?: string | null
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
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          photo_url: string
          caption?: string | null
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          photo_url?: string
          caption?: string | null
          is_featured?: boolean
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
      athlete_videos: {
        Row: {
          id: string
          athlete_id: string
          video_url: string
          video_type: string
          title: string
          description: string | null
          thumbnail_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          video_url: string
          video_type: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          video_url?: string
          video_type?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          is_featured?: boolean
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
      athlete_schedule: {
        Row: {
          id: string
          athlete_id: string
          event_title: string
          event_type: "game" | "practice" | "tournament" | "showcase"
          event_date: string
          event_time: string | null
          location: string | null
          opponent: string | null
          result: string | null
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          event_title: string
          event_type: "game" | "practice" | "tournament" | "showcase"
          event_date: string
          event_time?: string | null
          location?: string | null
          opponent?: string | null
          result?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          event_title?: string
          event_type?: "game" | "practice" | "tournament" | "showcase"
          event_date?: string
          event_time?: string | null
          location?: string | null
          opponent?: string | null
          result?: string | null
          created_at?: string
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
      athlete_reviews: {
        Row: {
          id: string
          athlete_id: string
          reviewer_name: string
          reviewer_title: string
          reviewer_organization: string | null
          review_text: string
          rating: number
          reviewer_contact: string | null
          reviewer_image_url: string | null
          location: string | null
          created_at: string
          updated_at: string
          is_verified: boolean | null
          verification_token: string | null
          verification_sent_at: string | null
          verified_at: string | null
          verification_expires_at: string | null
          review_date: string | null
          relationship_duration: string | null
          can_contact_reviewer: boolean | null
          athleticism_rating: number | null
          character_rating: number | null
          work_ethic_rating: number | null
          leadership_rating: number | null
          coachability_rating: number | null
          teamwork_rating: number | null
          academic_performance_rating: number | null
          potential_rating: number | null
        }
        Insert: {
          id?: string
          athlete_id: string
          reviewer_name: string
          reviewer_title: string
          reviewer_organization?: string | null
          review_text: string
          rating: number
          reviewer_contact?: string | null
          reviewer_image_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          is_verified?: boolean | null
          verification_token?: string | null
          verification_sent_at?: string | null
          verified_at?: string | null
          verification_expires_at?: string | null
          review_date?: string | null
          relationship_duration?: string | null
          can_contact_reviewer?: boolean | null
          athleticism_rating?: number | null
          character_rating?: number | null
          work_ethic_rating?: number | null
          leadership_rating?: number | null
          coachability_rating?: number | null
          teamwork_rating?: number | null
          academic_performance_rating?: number | null
          potential_rating?: number | null
        }
        Update: {
          id?: string
          athlete_id?: string
          reviewer_name?: string
          reviewer_title?: string
          reviewer_organization?: string | null
          review_text?: string
          rating?: number
          reviewer_contact?: string | null
          reviewer_image_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          is_verified?: boolean | null
          verification_token?: string | null
          verification_sent_at?: string | null
          verified_at?: string | null
          verification_expires_at?: string | null
          review_date?: string | null
          relationship_duration?: string | null
          can_contact_reviewer?: boolean | null
          athleticism_rating?: number | null
          character_rating?: number | null
          work_ethic_rating?: number | null
          leadership_rating?: number | null
          coachability_rating?: number | null
          teamwork_rating?: number | null
          academic_performance_rating?: number | null
          potential_rating?: number | null
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
      athlete_teams: {
        Row: {
          id: string
          athlete_id: string
          team_name: string
          position: string | null
          jersey_number: string | null
          season: string | null
          league: string | null
          stats: Json | null
          is_current: boolean | null
          is_public: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          team_name: string
          position?: string | null
          jersey_number?: string | null
          season?: string | null
          league?: string | null
          stats?: Json | null
          is_current?: boolean | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          team_name?: string
          position?: string | null
          jersey_number?: string | null
          season?: string | null
          league?: string | null
          stats?: Json | null
          is_current?: boolean | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_teams_athlete_id_fkey"
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
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          status: "open" | "in_progress" | "resolved" | "closed"
          priority: "low" | "medium" | "high" | "urgent"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          marketing_emails: boolean
          profile_visibility: "public" | "private"
          theme_preference: "light" | "dark" | "system"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          marketing_emails?: boolean
          profile_visibility?: "public" | "private"
          theme_preference?: "light" | "dark" | "system"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          marketing_emails?: boolean
          profile_visibility?: "public" | "private"
          theme_preference?: "light" | "dark" | "system"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_cards: {
        Row: {
          id: string
          athlete_id: string
          template_id: string
          design_data: any
          generated_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          template_id: string
          design_data: any
          generated_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          template_id?: string
          design_data?: any
          generated_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_cards_athlete_id_fkey"
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

// Analytics-specific types
export interface ProfileAnalytics {
  id: string
  athlete_id: string
  date: string
  page_views: number
  unique_visitors: number
  bounce_rate: number
  avg_session_duration: number
  referrer_data: Record<string, any>
  device_data: Record<string, any>
  location_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ProfileAudit {
  id: string
  athlete_id: string
  audit_date: string
  completeness_score: number
  seo_score: number
  social_score: number
  content_score: number
  recommendations: string[]
  missing_fields: string[]
  strengths: string[]
  created_at: string
}

export interface VisitorSession {
  id: string
  athlete_id: string
  session_id: string
  visitor_ip?: string
  user_agent?: string
  referrer?: string
  country?: string
  city?: string
  device_type?: string
  browser?: string
  os?: string
  pages_visited: string[]
  session_start: string
  session_end?: string
  total_time: number
  created_at: string
}

export interface PageView {
  id: string
  athlete_id: string
  session_id?: string
  page_path: string
  page_title?: string
  view_time: string
  time_on_page: number
  referrer?: string
  created_at: string
}

// Derived types for easier use
export interface AthleteProfile {
  id: string
  user_id: string
  athlete_name: string
  username: string
  sport: string
  sports?: string[]
  sport_positions?: string[]
  grade?: string
  graduation_year?: number
  school?: string
  location?: string
  bio?: string
  height?: string
  weight?: string
  gpa?: number
  sat_score?: number
  act_score?: number
  positions_played?: string
  dominant_foot?: string
  dominant_hand?: string
  profile_picture_url?: string
  primary_color?: string
  secondary_color?: string
  subscription_tier?: string
  subscription_status?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  is_profile_public: boolean
  content_order?: string[]
  email?: string
  phone?: string
  show_email?: boolean
  show_phone?: boolean
  theme_mode?: string
  created_at: string
  updated_at: string
  hero_image_url?: string
  default_hero_gender?: string
  instagram?: string
  twitter?: string
  tiktok?: string
  facebook?: string
  youtube?: string
  linkedin?: string
  website?: string
  maxpreps_url?: string
  ncsa_url?: string
  other_recruiting_profiles?: string[]
  profile_visibility?: string
  allow_coach_reviews?: boolean
  show_location?: boolean
  subdomain?: string
  enable_social_sharing?: boolean
}

export interface AthletePhoto {
  id: string
  athlete_id: string
  photo_url: string
  caption?: string
  is_public: boolean
  created_at: string
}

export interface AthleteVideo {
  id: string
  athlete_id: string
  title: string
  description?: string
  video_url: string
  video_type: string
  thumbnail_url?: string
  is_public: boolean
  is_featured?: boolean
  created_at: string
  updated_at: string
}

export interface AthleteAward {
  id: string
  athlete_id: string
  title: string
  organization?: string
  award_date?: string
  award_type?: string
  level?: string
  description?: string
  is_public: boolean
  created_at: string
}

export interface AthleteSchedule {
  id: string
  athlete_id: string
  event_name: string
  event_date: string
  event_time?: string
  location?: string
  event_type?: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AthleteReview {
  leadership: any
  coachability: any
  teamwork: any
  work_ethic: any
  character: any
  athleticism: any
  id: string
  athlete_id: string
  reviewer_name: string
  reviewer_title?: string
  reviewer_organization?: string
  reviewer_email?: string
  reviewer_phone?: string
  reviewer_image_url?: string
  review_text: string
  review_type?: string
  rating?: number
  relationship_duration?: string
  can_contact_reviewer?: boolean
  created_at: string
  updated_at: string
  is_verified?: boolean
  verified_at?: string
}

export interface AthleteTeam {
  id: string
  athlete_id: string
  team_name: string
  position?: string
  jersey_number?: string
  season?: string
  league?: string
  stats?: Record<string, any>
  is_current: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ContactSubmission {
  id: string
  athlete_id: string
  name: string
  email: string
  organization?: string | null
  message: string
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  updated_at: string
}

export interface BusinessCard {
  id: string
  athlete_id: string
  template_id: string
  design_data: any
  generated_url?: string | null
  created_at: string
  updated_at: string
}
