import { supabase } from "./supabase/client"
import type { DataProcessingConsent, ConsentUpdateRequest, DataExportRequest } from "@/types/compliance"

export class ComplianceManager {
  // Consent Management
  static async recordConsent(
    userId: string,
    consentType: "marketing" | "analytics" | "third_party" | "essential",
    granted: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DataProcessingConsent | null> {
    try {
      const { data, error } = await supabase
        .from("data_processing_consents")
        .insert({
          user_id: userId,
          consent_type: consentType,
          granted: granted,
          purpose: this.getConsentPurpose(consentType),
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error recording consent:", error)
      return null
    }
  }

  static async getUserConsents(userId: string): Promise<DataProcessingConsent[]> {
    const { data, error } = await supabase
      .from("data_processing_consents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async updateConsent(
    userId: string,
    consentUpdate: ConsentUpdateRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const { error } = await supabase.rpc("manage_consent", {
      p_user_id: userId,
      p_consent_type: consentUpdate.consent_type,
      p_purpose: consentUpdate.purpose || `${consentUpdate.consent_type} data processing`,
      p_granted: consentUpdate.granted,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    })

    if (error) throw error
  }

  static async hasValidConsent(userId: string, consentType: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("data_processing_consents")
      .select("granted")
      .eq("user_id", userId)
      .eq("consent_type", consentType)
      .single()

    if (error) return false
    return data?.granted || false
  }

  // Data Export
  static async requestDataExport(
    userId: string,
    exportType: "full_export" | "profile_only" | "media_only" = "full_export",
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("data_exports")
        .insert({
          user_id: userId,
          export_type: exportType,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single()

      if (error) throw error

      // Log the export request
      await this.logActivity(userId, "data_export_requested", "data_export", data.id)

      return data
    } catch (error) {
      console.error("Error requesting data export:", error)
      return null
    }
  }

  static async generateDataExport(userId: string): Promise<any> {
    try {
      // Fetch all user data
      const [
        { data: profile },
        { data: photos },
        { data: videos },
        { data: awards },
        { data: schedule },
        { data: reviews },
        { data: teams },
        { data: consents },
      ] = await Promise.all([
        supabase.from("athletes").select("*").eq("user_id", userId).single(),
        supabase.from("athlete_photos").select("*").eq("athlete_id", userId),
        supabase.from("athlete_videos").select("*").eq("athlete_id", userId),
        supabase.from("athlete_awards").select("*").eq("athlete_id", userId),
        supabase.from("athlete_schedule").select("*").eq("athlete_id", userId),
        supabase.from("athlete_reviews").select("*").eq("athlete_id", userId),
        supabase.from("athlete_teams").select("*").eq("athlete_id", userId),
        supabase.from("data_processing_consents").select("*").eq("user_id", userId),
      ])

      const exportData = {
        export_info: {
          generated_at: new Date().toISOString(),
          user_id: userId,
          export_version: "1.0",
          data_protection_notice: "This export contains all personal data we have collected about you.",
        },
        profile: profile,
        media: {
          photos: photos || [],
          videos: videos || [],
        },
        athletic_data: {
          awards: awards || [],
          schedule: schedule || [],
          teams: teams || [],
        },
        reviews: reviews || [],
        privacy_settings: {
          consents: consents || [],
        },
        metadata: {
          total_photos: photos?.length || 0,
          total_videos: videos?.length || 0,
          total_awards: awards?.length || 0,
          account_created: profile?.created_at,
          last_updated: profile?.updated_at,
        },
      }

      return exportData
    } catch (error) {
      console.error("Error generating data export:", error)
      throw error
    }
  }

  static async exportUserData(userId: string, options: DataExportRequest = {}): Promise<any> {
    const exportData: any = {
      export_metadata: {
        user_id: userId,
        exported_at: new Date().toISOString(),
        export_version: "1.0",
        format: options.format || "json",
      },
    }

    try {
      // Export profile data
      if (options.include_profile !== false) {
        const { data: profile } = await supabase.from("athlete_profiles").select("*").eq("id", userId).single()
        exportData.profile = profile
      }

      // Export media files
      if (options.include_media) {
        const [{ data: videos }, { data: photos }] = await Promise.all([
          supabase.from("athlete_videos").select("*").eq("user_id", userId),
          supabase.from("athlete_photos").select("*").eq("user_id", userId),
        ])
        exportData.media = { videos, photos }
      }

      // Export awards
      if (options.include_awards) {
        const { data: awards } = await supabase.from("athlete_awards").select("*").eq("user_id", userId)
        exportData.awards = awards
      }

      // Export schedule
      if (options.include_schedule) {
        const { data: schedule } = await supabase.from("athlete_schedule").select("*").eq("user_id", userId)
        exportData.schedule = schedule
      }

      // Export reviews
      if (options.include_reviews) {
        const { data: reviews } = await supabase.from("athlete_reviews").select("*").eq("athlete_id", userId)
        exportData.reviews = reviews
      }

      // Export audit logs (limited to last 90 days for privacy)
      if (options.include_audit_logs) {
        const { data: auditLogs } = await supabase
          .from("audit_logs")
          .select("action, resource_type, created_at")
          .eq("user_id", userId)
          .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        exportData.audit_logs = auditLogs
      }

      // Export consents
      const { data: consents } = await supabase
        .from("data_processing_consents")
        .select("consent_type, purpose, granted, granted_at, withdrawn_at")
        .eq("user_id", userId)
      exportData.consents = consents

      // Log the export
      await this.logActivity(userId, "data_exported", "user_data", userId, null, { export_options: options })

      return exportData
    } catch (error) {
      console.error("Data export failed:", error)
      throw new Error("Failed to export user data")
    }
  }

  // Account Deletion
  static async requestAccountDeletion(
    userId: string,
    reason?: string,
    deletionType: "full_deletion" | "partial_deletion" = "full_deletion",
  ): Promise<string> {
    // Generate verification token
    const verificationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { data, error } = await supabase
      .from("data_deletion_requests")
      .insert({
        user_id: userId,
        request_type: deletionType,
        verification_token: verificationToken,
        verification_expires_at: expiresAt.toISOString(),
        reason: reason,
      })
      .select("id")
      .single()

    if (error) throw error

    // Log the deletion request
    await this.logActivity(userId, "deletion_requested", "user_account", userId, null, {
      request_type: deletionType,
      reason,
    })

    return verificationToken
  }

  static async processAccountDeletion(userId: string): Promise<boolean> {
    try {
      // Start transaction-like operations
      const deletionPromises = [
        // Soft delete main profile
        supabase
          .from("athletes")
          .update({ deleted_at: new Date().toISOString() })
          .eq("user_id", userId),

        // Delete related data
        supabase
          .from("athlete_photos")
          .delete()
          .eq("athlete_id", userId),
        supabase.from("athlete_videos").delete().eq("athlete_id", userId),
        supabase.from("athlete_awards").delete().eq("athlete_id", userId),
        supabase.from("athlete_schedule").delete().eq("athlete_id", userId),
        supabase.from("athlete_reviews").delete().eq("athlete_id", userId),
        supabase.from("athlete_teams").delete().eq("athlete_id", userId),
        supabase.from("contact_submissions").delete().eq("athlete_id", userId),
        supabase.from("business_cards").delete().eq("athlete_id", userId),

        // Update deletion request status
        supabase
          .from("data_deletion_requests")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("status", "processing"),
      ]

      await Promise.all(deletionPromises)

      // Log the completion
      await this.logActivity(userId, "account_deletion_completed", "user_account", userId)

      return true
    } catch (error) {
      console.error("Error processing account deletion:", error)
      return false
    }
  }

  static async verifyAndProcessDeletion(verificationToken: string): Promise<boolean> {
    // Get the deletion request
    const { data: request, error } = await supabase
      .from("data_deletion_requests")
      .select("*")
      .eq("verification_token", verificationToken)
      .eq("status", "pending")
      .single()

    if (error || !request) {
      throw new Error("Invalid or expired verification token")
    }

    // Check if token is expired
    if (new Date(request.verification_expires_at) < new Date()) {
      throw new Error("Verification token has expired")
    }

    // Mark as verified
    await supabase
      .from("data_deletion_requests")
      .update({
        status: "processing",
        verified_at: new Date().toISOString(),
      })
      .eq("id", request.id)

    try {
      // Process the deletion based on type
      if (request.request_type === "full_deletion") {
        const { error: deleteError } = await supabase.rpc("permanently_delete_user_data", {
          p_user_id: request.user_id,
        })
        if (deleteError) throw deleteError
      } else {
        // Soft delete for partial deletion
        const { error: softDeleteError } = await supabase.rpc("soft_delete_user_data", {
          p_user_id: request.user_id,
        })
        if (softDeleteError) throw softDeleteError
      }

      // Mark as completed
      await supabase
        .from("data_deletion_requests")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", request.id)

      return true
    } catch (error) {
      // Mark as failed
      await supabase
        .from("data_deletion_requests")
        .update({
          status: "failed",
        })
        .eq("id", request.id)

      throw error
    }
  }

  // Audit Logging
  static async logActivity(
    userId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: Record<string, any> | null,
    newValues?: Record<string, any> | null,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const { error } = await supabase.rpc("log_audit_event", {
      p_user_id: userId,
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_old_values: oldValues,
      p_new_values: newValues,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    })

    if (error) {
      console.error("Failed to log audit event:", error)
    }
  }

  // Data Retention
  static async updateLastLogin(userId: string): Promise<void> {
    const { error } = await supabase
      .from("athlete_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Failed to update last login:", error)
    }
  }

  static async getRetentionPolicies() {
    const { data, error } = await supabase.from("data_retention_policies").select("*").order("data_type")

    if (error) throw error
    return data
  }

  // Utility functions
  static async getClientInfo(request: Request) {
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")
    const userAgent = request.headers.get("user-agent")

    return {
      ip_address: ip,
      user_agent: userAgent,
    }
  }

  // Helper methods
  private static getConsentPurpose(consentType: string): string {
    const purposes = {
      marketing: "Send promotional emails and marketing communications",
      analytics: "Analyze usage patterns to improve our services",
      third_party: "Share data with trusted partners for enhanced features",
      essential: "Essential functionality for the application to work",
    }
    return purposes[consentType as keyof typeof purposes] || "Data processing"
  }
}
