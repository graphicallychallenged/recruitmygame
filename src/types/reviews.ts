import type { AthleteReview } from "./database" // Assuming AthleteReview is declared in another file

export interface VerifiedReview extends AthleteReview {
  is_verified: boolean
  verification_token?: string
  verification_sent_at?: string
  verified_at?: string
  verification_expires_at?: string
  review_date: string
}

export interface ReviewVerificationRequest {
  id: string
  athlete_id: string
  reviewer_name: string
  reviewer_email: string
  reviewer_title?: string
  reviewer_organization?: string
  request_message: string
  rating?: number
  verification_token: string
  status: "pending" | "verified" | "expired" | "rejected"
  created_at: string
  expires_at: string
  verified_at?: string
  review_id?: string
}

export interface VerificationEmailData {
  reviewerName: string
  athleteName: string
  requestMessage: string
  verificationUrl: string
  expiresAt: string
}
