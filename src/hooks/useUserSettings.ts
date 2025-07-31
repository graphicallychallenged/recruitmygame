"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import { useToast } from "@chakra-ui/react"

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  review_notifications: boolean
  schedule_reminders: boolean
}

interface PrivacySettings {
  profile_visibility: "public" | "private" | "coaches_only"
  show_contact_info: boolean
  show_location: boolean
  allow_reviews: boolean
}

interface ActivityLog {
  id: string
  user_id: string
  activity_type: string
  description: string
  created_at: string
}

export function useUserSettings() {
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user settings
      const { data: userSettings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

      // Fetch athlete profile for privacy settings
      const { data: athleteProfile } = await supabase
        .from("athletes")
        .select("profile_visibility, allow_coach_reviews, show_location, show_email, show_phone")
        .eq("user_id", user.id)
        .single()

      if (userSettings) {
        setNotifications({
          email_notifications: userSettings.email_notifications ?? true,
          push_notifications: false, // Not implemented yet
          marketing_emails: userSettings.marketing_emails ?? false,
          review_notifications: true, // Default
          schedule_reminders: true, // Default
        })
      }

      if (athleteProfile) {
        setPrivacy({
          profile_visibility: athleteProfile.profile_visibility || "public",
          show_contact_info: athleteProfile.show_email || athleteProfile.show_phone || false,
          show_location: athleteProfile.show_location ?? true,
          allow_reviews: athleteProfile.allow_coach_reviews ?? true,
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateNotifications = async (updates: Partial<NotificationSettings>) => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        email_notifications: updates.email_notifications ?? notifications?.email_notifications ?? true,
        marketing_emails: updates.marketing_emails ?? notifications?.marketing_emails ?? false,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setNotifications((prev) => (prev ? { ...prev, ...updates } : null))

      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved.",
        status: "success",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error updating notifications:", error)
      toast({
        title: "Error updating notifications",
        description: error.message,
        status: "error",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePrivacy = async (updates: Partial<PrivacySettings>) => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { error } = await supabase
        .from("athletes")
        .update({
          profile_visibility: updates.profile_visibility ?? privacy?.profile_visibility ?? "public",
          allow_coach_reviews: updates.allow_reviews ?? privacy?.allow_reviews ?? true,
          show_location: updates.show_location ?? privacy?.show_location ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      setPrivacy((prev) => (prev ? { ...prev, ...updates } : null))

      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
        status: "success",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error updating privacy settings:", error)
      toast({
        title: "Error updating privacy settings",
        description: error.message,
        status: "error",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  const logActivity = async (activityType: string, description?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: activityType,
        details: description || activityType,
      })

      if (error) {
        console.error("Error logging activity:", error)
      }
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  return {
    notifications,
    privacy,
    activities,
    loading,
    saving,
    updateNotifications,
    updatePrivacy,
    logActivity,
  }
}
