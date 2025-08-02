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

export async function sendReviewRequestEmail(data: ReviewRequestEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Review Request from ${data.athleteName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #84cc16 0%, #14b8a6 50%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
        .athlete-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .message-box { background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .cta-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
        .verified-badge { background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .expiry-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏆 Verified Review Request</h1>
          <p>You've been asked to provide a verified review for a student-athlete</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.reviewerName},</p>
          
          <p>You have received a request to provide a <span class="verified-badge">✓ VERIFIED REVIEW</span> for the following student-athlete:</p>
          
          <div class="athlete-info">
            <h3>${data.athleteName}</h3>
            <p><strong>Sport:</strong> ${data.athleteSport}</p>
            <p><strong>School:</strong> ${data.athleteSchool}</p>
          </div>
          
          <div class="message-box">
            <h4>Personal Message from ${data.athleteName}:</h4>
            <p><em>"${data.requestMessage}"</em></p>
          </div>
          
          <p>Your verified review will help college recruiters and coaches get an authentic perspective on this athlete's character, work ethic, and abilities.</p>
          
          <div style="text-align: center;">
            <a href="${data.verificationLink}" class="cta-button">Write Verified Review</a>
          </div>
          
          <div class="expiry-notice">
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
          <p>This email was sent by RecruitMyGame on behalf of ${data.athleteName}</p>
          <p>If you did not expect this email, you can safely ignore it.</p>
          <p>© 2024 RecruitMyGame. All rights reserved.</p>
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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f56565; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
        .athlete-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Review Request Cancelled</h1>
        </div>
        
        <div class="content">
          <p>Hello ${data.reviewerName},</p>
          
          <p>The verified review request from the following student-athlete has been cancelled:</p>
          
          <div class="athlete-info">
            <h3>${data.athleteName}</h3>
            <p><strong>Sport:</strong> ${data.athleteSport}</p>
            <p><strong>School:</strong> ${data.athleteSchool}</p>
          </div>
          
          <p>No further action is required from you. If you have any questions, please feel free to contact us.</p>
          
          <p>Thank you for your time and willingness to support student-athletes.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 RecruitMyGame. All rights reserved.</p>
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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
        .athlete-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .notification-list { background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .cta-button { display: inline-block; background: #14b8a6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Verify Your Subscription</h1>
          <p>Confirm your subscription to ${data.athleteName}'s profile updates</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.subscriberName},</p>
          
          <p>Thank you for subscribing to updates from <strong>${data.athleteName}</strong>! To start receiving notifications, please verify your email address by clicking the button below.</p>
          
          <div class="athlete-info">
            <h3>You're subscribed to updates from:</h3>
            <p><strong>${data.athleteName}</strong></p>
            <p>Profile: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/${data.athleteUsername}">${process.env.NEXT_PUBLIC_SITE_URL}/${data.athleteUsername}</a></p>
          </div>
          
          <div class="notification-list">
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
          <p>This verification link will expire in 24 hours.</p>
          <p>© 2024 RecruitMyGame. All rights reserved.</p>
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

Profile: ${process.env.NEXT_PUBLIC_SITE_URL}/${data.athleteUsername}

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
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${data.athleteUsername}`

  let updateMessage = ""
  let updateDetails = ""

  switch (data.updateType) {
    case "new_video":
      updateMessage = `${data.athleteName} uploaded a new video`
      updateDetails = `
        <div class="update-details">
          <h4>New Video: ${data.updateContent?.video_title || "Untitled"}</h4>
          ${data.updateContent?.video_description ? `<p>${data.updateContent.video_description}</p>` : ""}
          <p><strong>Type:</strong> ${data.updateContent?.video_type || "Video"}</p>
        </div>
      `
      break
    case "new_photos":
      updateMessage = `${data.athleteName} uploaded new photos`
      updateDetails = `
        <div class="update-details">
          <h4>New Photos Added</h4>
          ${data.updateContent?.photo_caption ? `<p>${data.updateContent.photo_caption}</p>` : ""}
        </div>
      `
      break
    case "schedule_updated":
      updateMessage = `${data.athleteName} added a new event to their schedule`
      updateDetails = `
        <div class="update-details">
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
        <div class="update-details">
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
        <div class="update-details">
          <h4>Profile Updates</h4>
          <p>Updated: ${changesList.length > 0 ? changesList.join(", ") : "Various profile information"}</p>
        </div>
      `
      break
    default:
      updateMessage = `${data.athleteName} updated their profile`
      updateDetails = `<div class="update-details"><p>${data.updateDescription || "Check out the latest updates!"}</p></div>`
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${updateMessage}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
        .update-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6; }
        .cta-button { display: inline-block; background: #14b8a6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
        .unsubscribe { font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
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
          <p>You're receiving this because you subscribed to updates from ${data.athleteName}.</p>
          <p class="unsubscribe">
            <a href="${unsubscribeUrl}">Unsubscribe from these notifications</a>
          </p>
          <p>© 2024 RecruitMyGame. All rights reserved.</p>
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

export async function sendContactNotificationEmail(data: ContactNotificationData) {
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${data.athleteUsername}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message from Your Profile</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
        .contact-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .message-box { background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .cta-button { display: inline-block; background: #3182ce; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 New Contact Message</h1>
          <p>Someone contacted you through your RecruitMyGame profile</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.athleteName},</p>
          
          <p>You have received a new message through your RecruitMyGame profile contact form!</p>
          
          <div class="contact-info">
            <h3>Contact Information:</h3>
            <p><strong>Name:</strong> ${data.contactorName}</p>
            <p><strong>Email:</strong> ${data.contactorEmail}</p>
            ${data.contactorOrganization ? `<p><strong>Organization:</strong> ${data.contactorOrganization}</p>` : ""}
          </div>
          
          <div class="message-box">
            <h4>Message:</h4>
            <p>${data.message.replace(/\n/g, "<br>")}</p>
          </div>
          
          <p>This could be a coach, recruiter, or someone interested in learning more about your athletic journey. We recommend responding promptly to maintain good relationships with potential opportunities.</p>
          
          <div style="text-align: center;">
            <a href="mailto:${data.contactorEmail}?subject=Re: Contact from RecruitMyGame Profile" class="cta-button">Reply to ${data.contactorName}</a>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${profileUrl}" style="color: #3182ce; text-decoration: none;">View Your Profile</a>
          </div>
          
          <p><strong>Tips for responding:</strong></p>
          <ul>
            <li>Respond within 24-48 hours when possible</li>
            <li>Be professional and courteous</li>
            <li>Include relevant information about your athletic achievements</li>
            <li>Ask questions about their program or organization</li>
          </ul>
          
          <p>Good luck with your recruitment journey!</p>
        </div>
        
        <div class="footer">
          <p>This message was sent through your RecruitMyGame profile contact form.</p>
          <p>© 2024 RecruitMyGame. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
New Contact Message from Your Profile

Hello ${data.athleteName},

You have received a new message through your RecruitMyGame profile contact form!

Contact Information:
- Name: ${data.contactorName}
- Email: ${data.contactorEmail}
${data.contactorOrganization ? `- Organization: ${data.contactorOrganization}` : ""}

Message:
${data.message}

This could be a coach, recruiter, or someone interested in learning more about your athletic journey. We recommend responding promptly to maintain good relationships with potential opportunities.

Reply to: ${data.contactorEmail}
Your Profile: ${profileUrl}

Tips for responding:
- Respond within 24-48 hours when possible
- Be professional and courteous
- Include relevant information about your athletic achievements
- Ask questions about their program or organization

Good luck with your recruitment journey!

RecruitMyGame Team
  `

  try {
    const result = await resend.emails.send({
      from: "RecruitMyGame <notifications@recruitmygame.com>",
      to: [data.athleteEmail],
      replyTo: data.contactorEmail,
      subject: `New contact message from ${data.contactorName}`,
      html: htmlContent,
      text: textContent,
    })

    return result
  } catch (error) {
    console.error("Failed to send contact notification email:", error)
    throw error
  }
}
