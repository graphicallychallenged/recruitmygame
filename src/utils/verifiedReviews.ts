import { createClient } from "@/utils/supabase/server"
import { createClient as createClientClient } from "@/utils/supabase/client"
import { v4 as uuidv4 } from "uuid"
import type { VerifiedReview, ReviewVerificationRequest } from "@/types/reviews"

export interface ReviewVerificationData {
  reviewer_name: string
  reviewer_email: string
  reviewer_title?: string
  reviewer_organization?: string
  request_message: string
}

export interface ReviewSubmissionData {
  reviewer_name: string
  reviewer_email: string
  reviewer_title?: string
  reviewer_organization?: string
  review_text: string
  rating: number
}

export class VerifiedReviewsManager {
  private static async getServerClient() {
    return createClient()
  }

  private static async getClientClient() {
    return createClientClient()
  }

  // Send verification request to coach
  static async sendVerificationRequest(
    athleteId: string,
    data: ReviewVerificationData,
  ): Promise<{ success: boolean; verificationId: string; expiresAt: string }> {
    const supabase = await this.getServerClient()

    // Generate verification token
    const verificationToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Insert verification request
    const { data: request, error } = await supabase
      .from("review_verification_requests")
      .insert({
        athlete_id: athleteId,
        reviewer_name: data.reviewer_name,
        reviewer_email: data.reviewer_email,
        reviewer_title: data.reviewer_title,
        reviewer_organization: data.reviewer_organization,
        request_message: data.request_message,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create verification request: ${error.message}`)
    }

    // Get athlete info for email
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("first_name, last_name, athlete_name, sport, school")
      .eq("id", athleteId)
      .single()

    if (athleteError) {
      throw new Error(`Failed to get athlete info: ${athleteError.message}`)
    }

    // Send email (you'll need to implement this with your email service)
    await this.sendVerificationEmail({
      to: data.reviewer_email,
      reviewerName: data.reviewer_name,
      athleteName: `${athlete.first_name} ${athlete.last_name}`,
      athleteUsername: athlete.athlete_name,
      sport: athlete.sport,
      school: athlete.school,
      message: data.request_message,
      verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-review/${verificationToken}`,
    })

    return {
      success: true,
      verificationId: request.id,
      expiresAt: expiresAt.toISOString(),
    }
  }

  // Get verification request details (for the verification page)
  static async getVerificationRequest(verificationToken: string): Promise<{
    success: boolean
    request?: ReviewVerificationRequest
  }> {
    const supabase = await this.getServerClient()

    const { data: request, error } = await supabase
      .from("review_verification_requests")
      .select("*")
      .eq("verification_token", verificationToken)
      .eq("status", "pending")
      .single()

    if (error || !request) {
      throw new Error("Invalid or expired verification token")
    }

    // Check if expired
    if (new Date(request.expires_at) < new Date()) {
      await supabase.from("review_verification_requests").update({ status: "expired" }).eq("id", request.id)
      throw new Error("Verification link has expired")
    }

    return { success: true, request }
  }

  // Create verified review from coach's submission
  static async verifyAndCreateReview(token: string, reviewData: ReviewSubmissionData) {
    const supabase = await this.getServerClient()

    // Get verification request
    const { data: request, error: requestError } = await supabase
      .from("review_verification_requests")
      .select("*")
      .eq("verification_token", token)
      .eq("status", "pending")
      .single()

    if (requestError || !request) {
      throw new Error("Invalid or expired verification token")
    }

    // Check if token is expired
    if (new Date(request.expires_at) < new Date()) {
      throw new Error("Verification token has expired")
    }

    // Create the verified review
    const { data: review, error: reviewError } = await supabase
      .from("athlete_reviews")
      .insert({
        athlete_id: request.athlete_id,
        reviewer_name: reviewData.reviewer_name,
        reviewer_email: reviewData.reviewer_email,
        reviewer_title: reviewData.reviewer_title,
        reviewer_organization: reviewData.reviewer_organization,
        review_text: reviewData.review_text,
        rating: reviewData.rating,
        review_date: new Date().toISOString(),
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (reviewError) {
      throw new Error(`Failed to create review: ${reviewError.message}`)
    }

    // Update verification request status
    await supabase
      .from("review_verification_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", request.id)

    return review
  }

  // Create verified review from token and review data
  static async createVerifiedReview(token: string, reviewData: { review_text: string; rating: number }) {
    return await this.verifyAndCreateReview(token, {
      reviewer_name: "",
      reviewer_email: "",
      review_text: reviewData.review_text,
      rating: reviewData.rating,
    })
  }

  // Get verified reviews for an athlete
  static async getVerifiedReviews(athleteId: string): Promise<VerifiedReview[]> {
    const supabase = await this.getClientClient()

    const { data, error } = await supabase
      .from("athlete_reviews")
      .select("*")
      .eq("athlete_id", athleteId)
      .eq("is_verified", true)
      .order("verified_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get pending verification requests for an athlete
  static async getPendingVerifications(athleteId: string): Promise<ReviewVerificationRequest[]> {
    const supabase = await this.getClientClient()

    const { data, error } = await supabase
      .from("review_verification_requests")
      .select("*")
      .eq("athlete_id", athleteId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Send verification email (placeholder - integrate with your email service)
  private static async sendVerificationEmail(emailData: {
    to: string
    reviewerName: string
    athleteName: string
    athleteUsername: string
    sport: string
    school: string
    message: string
    verificationUrl: string
  }) {
    // For now, just log the email content
    // You'll need to implement this with your email service (SendGrid, etc.)
    console.log("Verification email would be sent:", {
      to: emailData.to,
      subject: `Review Request from ${emailData.athleteName}`,
      content: `
        Hi ${emailData.reviewerName},

        ${emailData.athleteName} (${emailData.sport} at ${emailData.school}) has requested a verified review from you.

        Their message:
        "${emailData.message}"

        To write and verify your review, please click the link below:
        ${emailData.verificationUrl}

        This link will expire in 7 days.

        Best regards,
        RecruitMyGame Team
      `,
    })

    // TODO: Implement actual email sending
    // Example with a hypothetical email service:
    // await emailService.send({
    //   to: emailData.to,
    //   subject: `Review Request from ${emailData.athleteName}`,
    //   html: emailTemplate,
    // })
  }

  // Check if user has Pro subscription for verified reviews
  static async canRequestVerifiedReviews(userId: string): Promise<boolean> {
    const supabase = await this.getClientClient()

    const { data: athlete } = await supabase.from("athletes").select("subscription_tier").eq("user_id", userId).single()

    return athlete?.subscription_tier === "pro"
  }

  // Get verification statistics
  static async getVerificationStats(athleteId: string): Promise<{
    totalVerified: number
    pendingVerifications: number
    averageRating: number
  }> {
    const supabase = await this.getClientClient()

    // Get verified reviews count and average rating
    const { data: verifiedReviews } = await supabase
      .from("athlete_reviews")
      .select("rating")
      .eq("athlete_id", athleteId)
      .eq("is_verified", true)

    // Get pending verifications count
    const { data: pendingRequests } = await supabase
      .from("review_verification_requests")
      .select("id")
      .eq("athlete_id", athleteId)
      .eq("status", "pending")

    const totalVerified = verifiedReviews?.length || 0
    const pendingVerifications = pendingRequests?.length || 0
    const averageRating =
      totalVerified > 0 ? verifiedReviews!.reduce((sum, review) => sum + review.rating, 0) / totalVerified : 0

    return {
      totalVerified,
      pendingVerifications,
      averageRating: Math.round(averageRating * 10) / 10,
    }
  }
}
