import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReviewRequestEmailData {
  reviewerEmail: string
  reviewerName: string
  athleteName: string
  athleteSport: string
  athleteSchool: string
  verificationLink: string
  requestMessage: string
  expiryDate: string
}

interface CancellationEmailData {
  reviewerEmail: string
  reviewerName: string
  athleteName: string
  athleteSport: string
  athleteSchool: string
}

interface SubscriptionVerificationEmailData {
  to: string
  subscriberEmail?: string
  subscriberName: string
  athleteName: string
  athleteUsername: string
  subscriptionTypes?: string[]
  notificationTypes: string[]
  verificationToken: string
}

interface ProfileUpdateNotificationData {
  to: string
  subscriberEmail?: string
  subscriberName: string
  athleteName: string
  athleteUsername: string
  updateType: string
  updateDescription: string
  updateContent?: any
  unsubscribeToken: string
}

interface ContactNotificationData {
  athleteEmail: string
  athleteName: string
  contactorName: string
  contactorEmail: string
  contactorOrganization?: string
  message: string
  athleteUsername: string
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

// Base email sending function (you'll need to implement with your email service)
async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // This is a placeholder - implement with your email service (SendGrid, AWS SES, etc.)
    console.log("Sending email:", options)

    // For now, just log the email content
    // In production, replace this with actual email service integration
    return true
  } catch (error) {
    console.error("Failed to send email:", error)
    return false
  }
}

export async function sendReviewRequestEmail(data: ReviewRequestEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Review Request from ${data.athleteName}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2d3748; 
          margin: 0; 
          padding: 0; 
          background-color: #f7fafc;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 20px; 
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .info-box { 
          background: #f0fdfa; 
          border: 1px solid #14b8a6; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .highlight-box { 
          background: #ecfdf5; 
          border-left: 4px solid #84cc16; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px;
          margin: 20px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer { 
          background: #1f2937; 
          color: #d1d5db; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
          line-height: 1.8;
        }
        .footer a { 
          color: #84cc16; 
          text-decoration: none; 
        }
        .verified-badge { 
          background: #84cc16; 
          color: white; 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          display: inline-block;
        }
        .warning-box { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://recruitmygame.com/logo-h.png" alt="Recruit My Game" class="logo">
          <h1>🏆 Verified Review Request</h1>
          <p>You've been asked to provide a verified review for a student-athlete</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.reviewerName},</p>
          
          <p>You have received a request to provide a <span class="verified-badge">✓ VERIFIED REVIEW</span> for the following student-athlete:</p>
          
          <div class="info-box">
            <h3>${data.athleteName}</h3>
            <p><strong>Sport:</strong> ${data.athleteSport}</p>
            <p><strong>School:</strong> ${data.athleteSchool}</p>
          </div>
          
          <div class="highlight-box">
            <h4>Personal Message from ${data.athleteName}:</h4>
            <p><em>"${data.requestMessage}"</em></p>
          </div>
          
          <p>Your verified review will help college recruiters and coaches get an authentic perspective on this athlete's character, work ethic, and abilities.</p>
          
          <div style="text-align: center;">
            <a href="${data.verificationLink}" class="cta-button">Write Verified Review</a>
          </div>
          
          <div class="warning-box">
            <strong>⏰ Important:</strong> This verification link will expire on ${data.expiryDate}. Please complete your review before this date.
          </div>
          
          <h4>What makes this review "verified"?</h4>
          <ul>
            <li>✅ Your identity is confirmed through email verification</li>
            <li>✅ Your review will be marked as verified on the athlete's profile</li>
            <li>✅ Recruiters will know this comes from a trusted source</li>
            <li>✅ You can choose whether to allow recruiters to contact you</li>
          </ul>
          
          <p>The review process takes about 5-10 minutes and includes rating the athlete on various attributes like athleticism, character, work ethic, and leadership.</p>
          
          <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          
          <p>Thank you for supporting student-athletes!</p>
        </div>
        
        <div class="footer">
          <p><strong>Join our community!</strong><br>
          Connect with other student-athletes and parents in our <a href="https://www.facebook.com/groups/recruitmygamecommunity/">Facebook Community Group</a></p>
          
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
            © 2025 Recruit My Game, Inc. All rights reserved.<br>
            Built for student-athletes by student-athlete parents who want to help their kid showcase their complete story.<br>
            Yes, we are a US-based, family run business!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Review Request from ${data.athleteName}

Hello ${data.reviewerName},

You have received a request to provide a VERIFIED REVIEW for:

${data.athleteName}
Sport: ${data.athleteSport}
School: ${data.athleteSchool}

Personal Message: "${data.requestMessage}"

To write your verified review, please visit: ${data.verificationLink}

This link expires on ${data.expiryDate}.

Your verified review will help college recruiters get an authentic perspective on this athlete.

Thank you for supporting student-athletes!

RecruitMyGame Team
  `

  try {
    const result = await resend.emails.send({
      from: "RecruitMyGame <reviews@recruitmygame.com>",
      to: [data.reviewerEmail],
      subject: `Verified Review Request from ${data.athleteName}`,
      html: htmlContent,
      text: textContent,
    })

    return result
  } catch (error) {
    console.error("Failed to send review request email:", error)
    throw error
  }
}

export async function sendCancellationEmail(data: CancellationEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Review Request Cancelled</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2d3748; 
          margin: 0; 
          padding: 0; 
          background-color: #f7fafc;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 20px; 
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .info-box { 
          background: #f0fdfa; 
          border: 1px solid #14b8a6; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .highlight-box { 
          background: #ecfdf5; 
          border-left: 4px solid #84cc16; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px;
          margin: 20px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer { 
          background: #1f2937; 
          color: #d1d5db; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
          line-height: 1.8;
        }
        .footer a { 
          color: #84cc16; 
          text-decoration: none; 
        }
        .verified-badge { 
          background: #84cc16; 
          color: white; 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          display: inline-block;
        }
        .warning-box { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://recruitmygame.com/logo-h.png" alt="Recruit My Game" class="logo">
          <h1>Review Request Cancelled</h1>
          <p></p>
        </div>
        
        <div class="content">
          <p>Hello ${data.reviewerName},</p>
          
          <p>The verified review request from the following student-athlete has been cancelled:</p>
          
          <div class="info-box">
            <h3>${data.athleteName}</h3>
            <p><strong>Sport:</strong> ${data.athleteSport}</p>
            <p><strong>School:</strong> ${data.athleteSchool}</p>
          </div>
          
          <p>No further action is required from you. If you have any questions, please feel free to contact us.</p>
          
          <p>Thank you for your time and willingness to support student-athletes.</p>
        </div>
        
        <div class="footer">
          <p><strong>Join our community!</strong><br>
          Connect with other student-athletes and parents in our <a href="https://www.facebook.com/groups/recruitmygamecommunity/">Facebook Community Group</a></p>
          
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
            © 2025 Recruit My Game, Inc. All rights reserved.<br>
            Built for student-athletes by student-athlete parents who want to help their kid showcase their complete story.<br>
            Yes, we are a US-based, family run business!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Review Request Cancelled

Hello ${data.reviewerName},

The verified review request from ${data.athleteName} (${data.athleteSport} at ${data.athleteSchool}) has been cancelled.

No further action is required from you.

Thank you for your time and willingness to support student-athletes.

RecruitMyGame Team
  `

  try {
    const result = await resend.emails.send({
      from: "RecruitMyGame <reviews@recruitmygame.com>",
      to: [data.reviewerEmail],
      subject: `Review Request Cancelled - ${data.athleteName}`,
      html: htmlContent,
      text: textContent,
    })

    return result
  } catch (error) {
    console.error("Failed to send cancellation email:", error)
    throw error
  }
}

export async function sendSubscriptionVerificationEmail(data: SubscriptionVerificationEmailData) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/verify/${data.verificationToken}`

  const subscriptionTypeNames = {
    profile_updated: "Profile Updates",
    new_video: "New Videos",
    new_photos: "New Photos",
    schedule_updated: "Schedule Updates",
    schedule_updates: "Schedule Updates",
    new_award: "New Awards",
  }

  const selectedNotifications = (data.subscriptionTypes || data.notificationTypes)
    .map((type) => subscriptionTypeNames[type as keyof typeof subscriptionTypeNames] || type)
    .join(", ")

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Subscription to ${data.athleteName}'s Updates</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2d3748; 
          margin: 0; 
          padding: 0; 
          background-color: #f7fafc;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 20px; 
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .info-box { 
          background: #f0fdfa; 
          border: 1px solid #14b8a6; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .highlight-box { 
          background: #ecfdf5; 
          border-left: 4px solid #84cc16; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px;
          margin: 20px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer { 
          background: #1f2937; 
          color: #d1d5db; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
          line-height: 1.8;
        }
        .footer a { 
          color: #84cc16; 
          text-decoration: none; 
        }
        .verified-badge { 
          background: #84cc16; 
          color: white; 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          display: inline-block;
        }
        .warning-box { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://recruitmygame.com/logo-h.png" alt="Recruit My Game" class="logo">
          <h1>🔔 Verify Your Subscription</h1>
          <p>Confirm your subscription to ${data.athleteName}'s profile updates</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.subscriberName},</p>
          
          <p>Thank you for subscribing to updates from <strong>${data.athleteName}</strong>! To start receiving notifications, please verify your email address by clicking the button below.</p>
          
          <div class="info-box">
            <h3>You're subscribed to updates from:</h3>
            <p><strong>${data.athleteName}</strong></p>
            <p>Profile: <a href="https://${data.athleteUsername}.recruitmygame.com">https://${data.athleteUsername}.recruitmygame.com</a></p>
          </div>
          
          <div class="info-box">
            <h4>You'll receive notifications for:</h4>
            <p>${selectedNotifications}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="cta-button">Verify Email & Start Receiving Updates</a>
          </div>
          
          <p>Once verified, you'll receive email notifications whenever ${data.athleteName} updates their profile with the content you selected.</p>
          
          <p>You can unsubscribe at any time by clicking the unsubscribe link in any notification email.</p>
          
          <p>If you didn't request this subscription, you can safely ignore this email.</p>
        </div>
        
        <div class="footer">
          <p><strong>Join our community!</strong><br>
          Connect with other student-athletes and parents in our <a href="https://www.facebook.com/groups/recruitmygamecommunity/">Facebook Community Group</a></p>
          
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
            © 2025 Recruit My Game, Inc. All rights reserved.<br>
            Built for student-athletes by student-athlete parents who want to help their kid showcase their complete story.<br>
            Yes, we are a US-based, family run business!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Verify Your Subscription to ${data.athleteName}'s Updates

Hello ${data.subscriberName},

Thank you for subscribing to updates from ${data.athleteName}! To start receiving notifications, please verify your email address.

You're subscribed to: ${selectedNotifications}

Verify your email: ${verificationUrl}

Profile: https://${data.athleteUsername}.recruitmygame.com

Once verified, you'll receive email notifications whenever ${data.athleteName} updates their profile.

You can unsubscribe at any time. If you didn't request this subscription, you can safely ignore this email.

RecruitMyGame Team
  `

  try {
    const result = await resend.emails.send({
      from: "RecruitMyGame <notifications@recruitmygame.com>",
      to: [data.subscriberEmail || data.to],
      subject: `Verify your subscription to ${data.athleteName}'s updates`,
      html: htmlContent,
      text: textContent,
    })

    return result
  } catch (error) {
    console.error("Failed to send subscription verification email:", error)
    throw error
  }
}

export async function sendProfileUpdateNotification(data: ProfileUpdateNotificationData) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/unsubscribe/${data.unsubscribeToken}`
  const profileUrl = `https://${data.athleteUsername}.recruitmygame.com`

  let updateMessage = ""
  let updateDetails = ""

  switch (data.updateType) {
    case "new_video":
      updateMessage = `${data.athleteName} uploaded a new video`
      updateDetails = `
        <div class="info-box">
          <h4>New Video: ${data.updateContent?.video_title || "Untitled"}</h4>
          ${data.updateContent?.video_description ? `<p>${data.updateContent.video_description}</p>` : ""}
          <p><strong>Type:</strong> ${data.updateContent?.video_type || "Video"}</p>
        </div>
      `
      break
    case "new_photos":
      updateMessage = `${data.athleteName} uploaded new photos`
      updateDetails = `
        <div class="info-box">
          <h4>New Photos Added</h4>
          ${data.updateContent?.photo_caption ? `<p>${data.updateContent.photo_caption}</p>` : ""}
        </div>
      `
      break
    case "schedule_updated":
      updateMessage = `${data.athleteName} added a new event to their schedule`
      updateDetails = `
        <div class="info-box">
          <h4>${data.updateContent?.event_name || "New Event"}</h4>
          <p><strong>Date:</strong> ${data.updateContent?.event_date ? new Date(data.updateContent.event_date).toLocaleDateString() : "TBD"}</p>
          <p><strong>Type:</strong> ${data.updateContent?.event_type || "Event"}</p>
          ${data.updateContent?.location ? `<p><strong>Location:</strong> ${data.updateContent.location}</p>` : ""}
        </div>
      `
      break
    case "new_award":
      updateMessage = `${data.athleteName} received a new award`
      updateDetails = `
        <div class="info-box">
          <h4>${data.updateContent?.award_title || "New Award"}</h4>
          ${data.updateContent?.organization ? `<p><strong>From:</strong> ${data.updateContent.organization}</p>` : ""}
          <p><strong>Date:</strong> ${data.updateContent?.award_date ? new Date(data.updateContent.award_date).toLocaleDateString() : "Recently"}</p>
          ${data.updateContent?.award_type ? `<p><strong>Type:</strong> ${data.updateContent.award_type}</p>` : ""}
        </div>
      `
      break
    case "profile_updated":
      updateMessage = `${data.athleteName} updated their profile`
      const changes = data.updateContent?.changes
      const changesList = []
      if (changes?.bio_updated) changesList.push("Bio")
      if (changes?.school_updated) changesList.push("School information")
      if (changes?.graduation_year_updated) changesList.push("Graduation year")
      if (changes?.gpa_updated) changesList.push("GPA")
      if (changes?.sat_score_updated) changesList.push("SAT score")
      if (changes?.act_score_updated) changesList.push("ACT score")

      updateDetails = `
        <div class="info-box">
          <h4>Profile Updates</h4>
          <p>Updated: ${changesList.length > 0 ? changesList.join(", ") : "Various profile information"}</p>
        </div>
      `
      break
    default:
      updateMessage = `${data.athleteName} updated their profile`
      updateDetails = `<div class="info-box"><p>${data.updateDescription || "Check out the latest updates!"}</p></div>`
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${updateMessage}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2d3748; 
          margin: 0; 
          padding: 0; 
          background-color: #f7fafc;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 20px; 
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .info-box { 
          background: #f0fdfa; 
          border: 1px solid #14b8a6; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .highlight-box { 
          background: #ecfdf5; 
          border-left: 4px solid #84cc16; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px;
          margin: 20px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer { 
          background: #1f2937; 
          color: #d1d5db; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
          line-height: 1.8;
        }
        .footer a { 
          color: #84cc16; 
          text-decoration: none; 
        }
        .verified-badge { 
          background: #84cc16; 
          color: white; 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          display: inline-block;
        }
        .warning-box { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://recruitmygame.com/logo-h.png" alt="Recruit My Game" class="logo">
          <h1>🚀 ${updateMessage}</h1>
          <p>New update from an athlete you're following</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.subscriberName},</p>
          
          <p>${updateMessage}! Here are the details:</p>
          
          ${updateDetails}
          
          <div style="text-align: center;">
            <a href="${profileUrl}" class="cta-button">View Full Profile</a>
          </div>
          
          <p>Stay connected with ${data.athleteName}'s athletic journey and don't miss any important updates!</p>
        </div>
        
        <div class="footer">
          <p><strong>Join our community!</strong><br>
          Connect with other student-athletes and parents in our <a href="https://www.facebook.com/groups/recruitmygamecommunity/">Facebook Community Group</a></p>
          
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
            © 2025 Recruit My Game, Inc. All rights reserved.<br>
            Built for student-athletes by student-athlete parents who want to help their kid showcase their complete story.<br>
            Yes, we are a US-based, family run business!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
${updateMessage}

Hello ${data.subscriberName},

${updateMessage}!

${data.updateType === "new_video" ? `New Video: ${data.updateContent?.video_title || "Untitled"}` : ""}
${data.updateType === "schedule_updated" ? `Event: ${data.updateContent?.event_name || "New Event"} on ${data.updateContent?.event_date ? new Date(data.updateContent.event_date).toLocaleDateString() : "TBD"}` : ""}
${data.updateType === "new_award" ? `Award: ${data.updateContent?.award_title || "New Award"}` : ""}

View full profile: ${profileUrl}

You're receiving this because you subscribed to updates from ${data.athleteName}.
Unsubscribe: ${unsubscribeUrl}

RecruitMyGame Team
  `

  try {
    const result = await resend.emails.send({
      from: "RecruitMyGame <notifications@recruitmygame.com>",
      to: [data.subscriberEmail || data.to],
      subject: updateMessage,
      html: htmlContent,
      text: textContent,
    })

    return result
  } catch (error) {
    console.error("Failed to send profile update notification:", error)
    throw error
  }
}

export async function sendContactNotificationEmail(
  athleteEmail: string,
  athleteName: string,
  contactData: {
    name: string
    email: string
    organization?: string
    message: string
  },
): Promise<boolean> {
  const subject = `New Contact Message - ${contactData.name}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2d3748; 
          margin: 0; 
          padding: 0; 
          background-color: #f7fafc;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 20px; 
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .info-box { 
          background: #f0fdfa; 
          border: 1px solid #14b8a6; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .highlight-box { 
          background: #ecfdf5; 
          border-left: 4px solid #84cc16; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px;
          margin: 20px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer { 
          background: #1f2937; 
          color: #d1d5db; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
          line-height: 1.8;
        }
        .footer a { 
          color: #84cc16; 
          text-decoration: none; 
        }
        .verified-badge { 
          background: #84cc16; 
          color: white; 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          display: inline-block;
        }
        .warning-box { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://recruitmygame.com/logo-h.png" alt="Recruit My Game" class="logo">
          <h2>New Contact Message</h2>
          <p>Someone is interested in connecting with you!</p>
        </div>
      
        <div class="content">
          <h3 style="color: #2d3748; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          ${contactData.organization ? `<p><strong>Organization:</strong> ${contactData.organization}</p>` : ""}
        
          <h3 style="color: #2d3748; margin-top: 20px;">Message</h3>
          <div class="highlight-box">
            <p style="margin: 0; line-height: 1.6;">${contactData.message}</p>
          </div>
        </div>
      
        <div class="content">
          <h3 style="color: #2b6cb0; margin-top: 0;">💡 Response Tips</h3>
          <ul style="color: #2c5282; margin: 10px 0;">
            <li>Respond within 24-48 hours for best results</li>
            <li>Be professional and highlight your achievements</li>
            <li>Ask about their program and what they're looking for</li>
            <li>Include links to your game film or highlights</li>
          </ul>
        </div>
      
        <div class="footer">
          <p><strong>Join our community!</strong><br>
          Connect with other student-athletes and parents in our <a href="https://www.facebook.com/groups/recruitmygamecommunity/">Facebook Community Group</a></p>
        
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
            © 2025 Recruit My Game, Inc. All rights reserved.<br>
            Built for student-athletes by student-athlete parents who want to help their kid showcase their complete story.<br>
            Yes, we are a US-based, family run business!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: athleteEmail,
    subject,
    html,
    from: "RecruitMyGame <noreply@recruitmygame.com>",
  })
}

export async function sendReviewVerificationEmail(
  reviewerEmail: string,
  reviewerName: string,
  athleteName: string,
  verificationToken: string,
): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-review/${verificationToken}`

  const subject = `Verify Your Review for ${athleteName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Review</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2d3748; 
          margin: 0; 
          padding: 0; 
          background-color: #f7fafc;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 20px; 
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .info-box { 
          background: #f0fdfa; 
          border: 1px solid #14b8a6; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .highlight-box { 
          background: #ecfdf5; 
          border-left: 4px solid #84cc16; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px;
          margin: 20px 0; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer { 
          background: #1f2937; 
          color: #d1d5db; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
          line-height: 1.8;
        }
        .footer a { 
          color: #84cc16; 
          text-decoration: none; 
        }
        .verified-badge { 
          background: #84cc16; 
          color: white; 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          display: inline-block;
        }
        .warning-box { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://recruitmygame.com/logo-h.png" alt="Recruit My Game" class="logo">
          <h2>Verify Your Review</h2>
          <p>Please verify your review for ${athleteName}</p>
        </div>
      
        <div class="content">
          <p>Hi ${reviewerName},</p>
          <p>Thank you for submitting a review for ${athleteName}. To ensure the authenticity of reviews on our platform, please verify your review by clicking the button below.</p>
        
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="cta-button">
              Verify Review
            </a>
          </div>
        
          <p style="color: #718096; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #3182ce;">${verificationUrl}</a>
          </p>
        
          <p style="color: #718096; font-size: 14px;">
            This verification link will expire in 7 days. If you didn't submit this review, please ignore this email.
          </p>
        </div>
      
        <div class="footer">
          <p><strong>Join our community!</strong><br>
          Connect with other student-athletes and parents in our <a href="https://www.facebook.com/groups/recruitmygamecommunity/">Facebook Community Group</a></p>
        
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
            © 2025 Recruit My Game, Inc. All rights reserved.<br>
            Built for student-athletes by student-athlete parents who want to help their kid showcase their complete story.<br>
            Yes, we are a US-based, family run business!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: reviewerEmail,
    subject,
    html,
    from: "RecruitMyGame <noreply@recruitmygame.com>",
  })
}
