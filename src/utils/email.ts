import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReviewRequestEmailData {
  to: string
  reviewerName: string
  athleteName: string
  athleteUsername: string
  sport: string
  school: string
  message: string
  verificationUrl: string
}

interface ReviewCancellationEmailData {
  to: string
  reviewerName: string
  athleteName: string
  athleteUsername: string
  sport: string
  school: string
  originalMessage: string
}

export async function sendReviewRequestEmail(data: ReviewRequestEmailData) {
  const { to, reviewerName, athleteName, athleteUsername, sport, school, message, verificationUrl } = data

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Athlete Review Request from ${athleteName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, rgba(132, 204, 22, 0.9) 0%, rgba(20, 184, 166, 0.8) 50%, rgba(6, 182, 212, 0.9) 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .athlete-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
          .expiry-notice { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏆 Athlete Review Request</h1>
          <p>You've been asked to provide a verified review</p>
        </div>
        
        <div class="content">
          <p>Hello ${reviewerName},</p>
          
          <p>You have received a request to provide a verified review for:</p>
          
          <div class="athlete-info">
            <h3>${athleteName}</h3>
            <p><strong>Sport:</strong> ${sport}</p>
            <p><strong>School:</strong> ${school}</p>
            <p><strong>Profile:</strong> recruitmygame.com/${athleteUsername}</p>
          </div>
          
          <div class="message-box">
            <h4>Personal Message from ${athleteName}:</h4>
            <p style="font-style: italic;">"${message}"</p>
          </div>
          
          <p>To complete your verified review, please click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="cta-button">Complete Review</a>
          </div>
          
          <div class="expiry-notice">
            <strong>⏰ Important:</strong> This review link will expire in 7 days. Please complete your review before then.
          </div>
          
           <p>The review form includes categories for:</p>
            <ul>
              <li>Athleticism & Skill</li>
              <li>Character & Integrity</li>
              <li>Work Ethic</li>
              <li>Leadership</li>
              <li>Coachability</li>
              <li>Teamwork</li>
            </ul>
            
            <p>Your review will be marked as "verified" and will carry more weight with college recruiters.</p>
            
            <p>Thank you for taking the time to help ${athleteName} in their recruiting journey!</p>
          
          <p>If you have any questions or did not expect this request, please contact us at support@recruitmygame.com</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by RecruitMyGame on behalf of ${athleteName}</p>
          <p>© 2025 RecruitMyGame. All rights reserved. Made for student athletes by a student athlete's mom. We are a family-run, US based business.</p>
        </div>
      </body>
    </html>
  `

  const textContent = `
Review Request from ${athleteName}

Hello ${reviewerName},

You have received a request to provide a verified review for ${athleteName}, a ${sport} player at ${school}.

Personal Message: "${message}"

To complete your verified review, please visit: ${verificationUrl}

This link will expire in 7 days.

Your review will be marked as "verified" and will help ${athleteName} in their recruiting journey.

If you have any questions, please contact us at support@recruitmygame.com

© 2024 RecruitMyGame
  `

  return await resend.emails.send({
    from: "RecruitMyGame <noreply@recruitmygame.com>",
    to,
    subject: `Review Request from ${athleteName}`,
    html: htmlContent,
    text: textContent,
  })
}

export async function sendReviewCancellationEmail(data: ReviewCancellationEmailData) {
  const { to, reviewerName, athleteName, athleteUsername, sport, school, originalMessage } = data

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Athlete Review Request Cancelled - ${athleteName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .athlete-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff7675; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
          .notice { background: #ffe8e6; border: 1px solid #ff7675; color: #d63031; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Review Request Cancelled</h1>
          <p>A review request has been withdrawn</p>
        </div>
        
        <div class="content">
          <p>Hello ${reviewerName},</p>
          
          <div class="notice">
            <strong>Notice:</strong> The review request from ${athleteName} has been cancelled and no longer requires your response.
          </div>
          
          <p>The following review request has been withdrawn:</p>
          
          <div class="athlete-info">
            <h3>${athleteName}</h3>
            <p><strong>Sport:</strong> ${sport}</p>
            <p><strong>School:</strong> ${school}</p>
            <p><strong>Profile:</strong> recruitmygame.com/${athleteUsername}</p>
          </div>
          
          <div class="message-box">
            <h4>Original Message:</h4>
            <p style="font-style: italic;">"${originalMessage}"</p>
          </div>
          
          <p>You do not need to take any action. If you have any questions about this cancellation, please contact us at support@recruitmygame.com</p>
          
          <p>Thank you for your time and consideration.</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by RecruitMyGame on behalf of ${athleteName}</p>
         <p>© 2025 RecruitMyGame. All rights reserved. Made for student athletes by a student athlete's mom. We are a family-run, US based business.</p>
        </div>
      </body>
    </html>
  `

  const textContent = `
Athlete Review Request Cancelled - ${athleteName}

Hello ${reviewerName},

The review request from ${athleteName} (${sport} player at ${school}) has been cancelled and no longer requires your response.

Original Message: "${originalMessage}"

You do not need to take any action. If you have any questions, please contact us at support@recruitmygame.com

Thank you for your time and consideration.

© 2024 RecruitMyGame
  `

  return await resend.emails.send({
    from: "RecruitMyGame <noreply@recruitmygame.com>",
    to,
    subject: `Review Request Cancelled - ${athleteName}`,
    html: htmlContent,
    text: textContent,
  })
}
