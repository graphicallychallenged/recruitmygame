import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SupportContactData {
  name: string
  email: string
  subject: string
  category: string
  priority: string
  message: string
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: SupportContactData = await request.json()

    const { name, email, subject, category, priority, message, userId } = data

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Request from ${name}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
          .info-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .message-box { background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
          .priority-high { border-left-color: #f56565; background: #fed7d7; }
          .priority-medium { border-left-color: #ed8936; background: #feebc8; }
          .priority-low { border-left-color: #48bb78; background: #c6f6d5; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
          .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; }
          .badge-high { background: #f56565; }
          .badge-medium { background: #ed8936; }
          .badge-low { background: #48bb78; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Support Request</h1>
            <p>New support request from RecruitMyGame user</p>
          </div>
          
          <div class="content">
            <div class="info-section">
              <h3>Contact Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${userId ? `<p><strong>User ID:</strong> ${userId}</p>` : ""}
              <p><strong>Subject:</strong> ${subject}</p>
              ${category ? `<p><strong>Category:</strong> ${category}</p>` : ""}
              <p><strong>Priority:</strong> <span class="badge badge-${priority}">${priority.toUpperCase()}</span></p>
            </div>
            
            <div class="message-box priority-${priority}">
              <h4>Message:</h4>
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
            
            <div class="info-section">
              <h4>Next Steps:</h4>
              <ul>
                <li>Respond to the user at: <strong>${email}</strong></li>
                <li>Expected response time: ${priority === "high" ? "2-4 hours" : priority === "medium" ? "12-24 hours" : "24-48 hours"}</li>
                ${category ? `<li>Category: ${category}</li>` : ""}
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This support request was submitted through the RecruitMyGame Support Center</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Support Request from ${name}

Contact Information:
- Name: ${name}
- Email: ${email}
${userId ? `- User ID: ${userId}` : ""}
- Subject: ${subject}
${category ? `- Category: ${category}` : ""}
- Priority: ${priority.toUpperCase()}

Message:
${message}

Please respond to: ${email}
Expected response time: ${priority === "high" ? "2-4 hours" : priority === "medium" ? "12-24 hours" : "24-48 hours"}

Submitted: ${new Date().toLocaleString()}
    `

    // Send email to support team
    const result = await resend.emails.send({
      from: "RecruitMyGame Support <noreply@recruitmygame.com>",
      to: ["support@recruitmygame.com"],
      replyTo: email,
      subject: `[${priority.toUpperCase()}] ${category ? `[${category.toUpperCase()}] ` : ""}${subject}`,
      html: htmlContent,
      text: textContent,
    })

    // Send confirmation email to user
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Request Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
          .info-box { background: #f0fff4; padding: 20px; border-left: 4px solid #48bb78; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Support Request Received</h1>
            <p>We've received your support request</p>
          </div>
          
          <div class="content">
            <p>Hello ${name},</p>
            
            <p>Thank you for contacting RecruitMyGame support. We have received your request and will respond as soon as possible.</p>
            
            <div class="info-box">
              <h4>Your Request Details:</h4>
              <p><strong>Subject:</strong> ${subject}</p>
              ${category ? `<p><strong>Category:</strong> ${category}</p>` : ""}
              <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
              <p><strong>Expected Response Time:</strong> ${priority === "high" ? "2-4 hours" : priority === "medium" ? "12-24 hours" : "24-48 hours"}</p>
            </div>
            
            <p>Our support team will review your request and respond to this email address: <strong>${email}</strong></p>
            
            <p>In the meantime, you might find answers to common questions in our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/support">Support Center FAQ</a>.</p>
            
            <p>Thank you for using RecruitMyGame!</p>
            
            <p>Best regards,<br>The RecruitMyGame Support Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated confirmation email.</p>
            <p>© 2024 RecruitMyGame. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const confirmationText = `
Support Request Received

Hello ${name},

Thank you for contacting RecruitMyGame support. We have received your request and will respond as soon as possible.

Your Request Details:
- Subject: ${subject}
${category ? `- Category: ${category}` : ""}
- Priority: ${priority.toUpperCase()}
- Expected Response Time: ${priority === "high" ? "2-4 hours" : priority === "medium" ? "12-24 hours" : "24-48 hours"}

Our support team will review your request and respond to: ${email}

Thank you for using RecruitMyGame!

Best regards,
The RecruitMyGame Support Team
    `

    // Send confirmation to user
    await resend.emails.send({
      from: "RecruitMyGame Support <support@recruitmygame.com>",
      to: [email],
      subject: `Support Request Received: ${subject}`,
      html: confirmationHtml,
      text: confirmationText,
    })

    return NextResponse.json({
      success: true,
      message: "Support request sent successfully",
      emailId: result.data?.id,
    })
  } catch (error: any) {
    console.error("Error sending support email:", error)
    return NextResponse.json({ error: "Failed to send support request" }, { status: 500 })
  }
}
