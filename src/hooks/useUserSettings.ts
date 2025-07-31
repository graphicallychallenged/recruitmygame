"use client"

import { useState, useEffect } from "react"
import { useToast } from "@chakra-ui/react"
import { supabase } from "@/utils/supabase/client"

export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  review_notifications: boolean
  schedule_reminders: boolean
}

export interface PrivacySettings {
  profile_visibility: "public" | "private" | "coaches_only"
  show_contact_info: boolean
  show_location: boolean
  show_birth_date: boolean
  allow_reviews: boolean
}

export interface UserActivity {
  id: string
  action: string
  details?: any
  created_at: string
}

export function useUserSettings() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    marketing_emails: false,
    review_notifications: true,
    schedule_reminders: true,
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: "public",
    show_contact_info: true,
    show_location: true,
    show_birth_date: false,
    allow_reviews: true,
  })

  const [activities, setActivities] = useState<UserActivity[]>([])
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

      // Fetch notification settings
      const { data: notificationData } = await supabase
        .from("user_notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (notificationData) {
        setNotifications({
          email_notifications: notificationData.email_notifications,
          push_notifications: notificationData.push_notifications,
          marketing_emails: notificationData.marketing_emails,
          review_notifications: notificationData.review_notifications,
          schedule_reminders: notificationData.schedule_reminders,
        })
      }

      // Fetch privacy settings
      const { data: privacyData } = await supabase
        .from("user_privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (privacyData) {
        setPrivacy({
          profile_visibility: privacyData.profile_visibility,
          show_contact_info: privacyData.show_contact_info,
          show_location: privacyData.show_location,
          show_birth_date: privacyData.show_birth_date,
          allow_reviews: privacyData.allow_reviews,
        })
      }

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from("user_activity_log")
        .select("id, action, details, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (activityData) {
        setActivities(activityData)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        status: "error",
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const updateNotifications = async (newSettings: Partial<NotificationSettings>) => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const oldSettings = { ...notifications }
      const updatedSettings = { ...notifications, ...newSettings }

      const { error } = await supabase
        .from("user_notification_settings")
        .upsert({
          user_id: user.id,
          ...updatedSettings,
        })
        .eq("user_id", user.id)

      if (error) throw error

      setNotifications(updatedSettings)

      // Log the activity with detailed change information
      const changedFields = Object.keys(newSettings).filter(
        (key) => oldSettings[key as keyof NotificationSettings] !== newSettings[key as keyof NotificationSettings],
      )

      await logActivity(
        "notification_settings_updated",
        "user_settings",
        user.id,
        oldSettings,
        newSettings,
        `Updated notification settings: ${changedFields.join(", ")}`,
      )

      toast({
        title: "Success",
        description: "Notification settings updated",
        status: "success",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        status: "error",
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePrivacy = async (newSettings: Partial<PrivacySettings>) => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const oldSettings = { ...privacy }
      const updatedSettings = { ...privacy, ...newSettings }

      const { error } = await supabase
        .from("user_privacy_settings")
        .upsert({
          user_id: user.id,
          ...updatedSettings,
        })
        .eq("user_id", user.id)

      if (error) throw error

      setPrivacy(updatedSettings)

      // Log the activity with detailed change information
      const changedFields = Object.keys(newSettings).filter(
        (key) => oldSettings[key as keyof PrivacySettings] !== newSettings[key as keyof PrivacySettings],
      )

      await logActivity(
        "privacy_settings_updated",
        "user_settings",
        user.id,
        oldSettings,
        newSettings,
        `Updated privacy settings: ${changedFields.join(", ")}`,
      )

      toast({
        title: "Success",
        description: "Privacy settings updated",
        status: "success",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        status: "error",
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const logActivity = async (
    action: string,
    resourceType = "user_settings",
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    description?: string,
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Try to use the audit_logs table if it exists, otherwise use user_activity_log
      const { error: auditError } = await supabase.from("audit_logs").insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId || user.id,
        old_values: oldValues,
        new_values: newValues,
        description,
        ip_address: null, // Could be populated from request headers
        user_agent: navigator.userAgent,
      })

      if (auditError) {
        // Fallback to user_activity_log
        await supabase.from("user_activity_log").insert({
          user_id: user.id,
          action,
          details: {
            resource_type: resourceType,
            resource_id: resourceId,
            old_values: oldValues,
            new_values: newValues,
            description,
          },
        })
      }

      // Refresh activities
      fetchSettings()
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
    refetch: fetchSettings,
  }
}
