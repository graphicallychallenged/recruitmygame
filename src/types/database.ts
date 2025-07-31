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
          positions_played: string[] | null
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
          positions_played?: string[] | null
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
          positions_played?: string[] | null
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
        }
        Relationships: []
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
          video_type: "youtube" | "vimeo" | "upload"
          title: string
          description: string | null
          thumbnail_url: string | null
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          video_url: string
          video_type: "youtube" | "vimeo" | "upload"
          title: string
          description?: string | null
          thumbnail_url?: string | null
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          video_url?: string
          video_type?: "youtube" | "vimeo" | "upload"
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          is_featured?: boolean
          created_at?: string
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
          jersey_number: number | null
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
          jersey_number?: number | null
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
          jersey_number?: number | null
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
          priority: "low" | "medium" | "high"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high"
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

// Derived types for easier use
export interface AthleteProfile {
  id: string
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
  positions_played?: string[] | null
  sport_positions?: Record<string, string[]> | null
  dominant_foot?: string | null
  dominant_hand?: string | null
  profile_picture_url?: string | null
  hero_image_url?: string | null
  default_hero_gender?: string | null
  primary_color?: string | null
  secondary_color?: string | null
  subscription_tier?: string | null
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
  created_at: string
  updated_at: string
  instagram?: string | null
  twitter?: string | null
  tiktok?: string | null
  facebook?: string | null
  youtube?: string | null
  linkedin?: string | null
  website?: string | null
  maxpreps_url?: string | null
  ncsa_url?: string | null
  other_recruiting_profiles?: RecruitingProfile[] | null
  profile_visibility?: ProfileVisibility | null
}

export interface RecruitingProfile {
  name: string
  url: string
}

export interface ProfileVisibility {
  show_stats: boolean
  show_contact: boolean
  show_social: boolean
}

export interface AthletePhoto {
  id: string
  athlete_id: string
  photo_url: string
  caption?: string | null
  is_public: boolean
  created_at: string
}

export interface AthleteVideo {
  id: string
  athlete_id: string
  title: string
  description?: string | null
  video_url: string
  video_type: "youtube" | "vimeo" | "upload"
  thumbnail_url?: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AthleteAward {
  id: string
  athlete_id: string
  title: string
  organization?: string | null
  award_date: string
  award_type?: string | null
  level?: string | null
  description?: string | null
  is_public: boolean
  created_at: string
}

export interface AthleteSchedule {
  id: string
  athlete_id: string
  event_name: string
  event_date: string
  event_time?: string | null
  location?: string | null
  event_type?: string | null
  description?: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AthleteReview {
  id: string
  athlete_id: string
  reviewer_name: string
  reviewer_title?: string | null
  reviewer_organization?: string | null
  reviewer_email?: string | null
  reviewer_phone?: string | null
  reviewer_image_url?: string | null
  review_text: string
  review_type?: string | null
  rating?: number | null
  relationship_duration?: string | null
  can_contact_reviewer?: boolean | null
  created_at: string
  updated_at: string
}

export interface AthleteTeam {
  id: string
  athlete_id: string
  team_name: string
  position?: string | null
  jersey_number?: number | null
  season?: string | null
  league?: string | null
  stats?: Record<string, any> | null
  is_current?: boolean | null
  is_public?: boolean | null
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
