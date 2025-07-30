export interface DataProcessingConsent {
  id: string
  user_id: string
  consent_type: "marketing" | "analytics" | "third_party" | "essential"
  purpose: string
  granted: boolean
  granted_at?: string
  withdrawn_at?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface DataDeletionRequest {
  id: string
  user_id: string
  request_type: "full_deletion" | "partial_deletion"
  status: "pending" | "processing" | "completed" | "failed"
  verification_token?: string
  verification_expires_at?: string
  verified_at?: string
  processed_at?: string
  deletion_data?: Record<string, any>
  reason?: string
  created_at: string
  updated_at: string
}

export interface DataRetentionPolicy {
  id: string
  data_type: string
  retention_period_days: number
  auto_delete: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface ConsentUpdateRequest {
  consent_type: DataProcessingConsent["consent_type"]
  granted: boolean
  purpose?: string
}

export interface DataExportRequest {
  include_profile?: boolean
  include_media?: boolean
  include_awards?: boolean
  include_schedule?: boolean
  include_reviews?: boolean
  include_audit_logs?: boolean
  format?: "json" | "csv"
}

export interface ComplianceStats {
  total_users: number
  active_consents: number
  pending_deletions: number
  audit_events_today: number
  data_exports_this_month: number
}
