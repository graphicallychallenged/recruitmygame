import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import crypto from "crypto"

const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID
const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET
const CANVA_REDIRECT_URI = process.env.CANVA_REDIRECT_URI

// Helper function to generate PKCE challenge
function generateCodeChallenge(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest("base64url")
}

// Helper function to generate code verifier
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, athlete_data, options } = body

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has a valid Canva token
    const { data: tokenData } = await supabase.from("canva_tokens").select("*").eq("user_id", user.id).single()

    if (!tokenData || new Date(tokenData.expires_at) <= new Date()) {
      // Need to authorize with Canva
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = generateCodeChallenge(codeVerifier)

      // Store the PKCE verifier
      await supabase.from("canva_oauth_state").upsert({
        user_id: user.id,
        code_verifier: codeVerifier,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })

      const authUrl = new URL("https://www.canva.com/api/oauth/authorize")
      authUrl.searchParams.set("code_challenge_method", "S256")
      authUrl.searchParams.set("response_type", "code")
      authUrl.searchParams.set("client_id", CANVA_CLIENT_ID!)
      authUrl.searchParams.set("redirect_uri", CANVA_REDIRECT_URI!)
      authUrl.searchParams.set(
        "scope",
        "design:content:write asset:write design:meta:read design:content:read asset:read",
      )
      authUrl.searchParams.set("code_challenge", codeChallenge)
      authUrl.searchParams.set("state", user.id)

      return NextResponse.json(
        {
          error: "Authorization required",
          auth_url: authUrl.toString(),
        },
        { status: 401 },
      )
    }

    // Generate business card using Canva API
    try {
      // First, create a design from the template
      const createDesignResponse = await fetch("https://api.canva.com/rest/v1/designs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          design_type: "BusinessCard",
          template_id: template_id,
        }),
      })

      if (!createDesignResponse.ok) {
        const errorData = await createDesignResponse.text()
        console.error("Failed to create design:", errorData)
        throw new Error("Failed to create design from template")
      }

      const designData = await createDesignResponse.json()
      const designId = designData.design.id

      // Update the design with athlete data
      const updateResponse = await fetch(`https://api.canva.com/rest/v1/designs/${designId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          elements: [
            {
              type: "text",
              text: athlete_data.name,
              placeholder: "{{name}}",
            },
            {
              type: "text",
              text: athlete_data.sport,
              placeholder: "{{sport}}",
            },
            {
              type: "text",
              text: athlete_data.school || "",
              placeholder: "{{school}}",
            },
            ...(options.includeEmail && athlete_data.email
              ? [
                  {
                    type: "text",
                    text: athlete_data.email,
                    placeholder: "{{email}}",
                  },
                ]
              : []),
            ...(options.includePhone && athlete_data.phone
              ? [
                  {
                    type: "text",
                    text: athlete_data.phone,
                    placeholder: "{{phone}}",
                  },
                ]
              : []),
          ],
        }),
      })

      if (!updateResponse.ok) {
        console.error("Failed to update design with athlete data")
      }

      // Export the design as PNG
      const exportResponse = await fetch(`https://api.canva.com/rest/v1/designs/${designId}/export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: {
            type: "png",
            quality: "high",
          },
        }),
      })

      if (!exportResponse.ok) {
        const errorData = await exportResponse.text()
        console.error("Failed to export design:", errorData)
        throw new Error("Failed to export business card")
      }

      const exportData = await exportResponse.json()
      const downloadUrl = exportData.job.urls[0].url

      // Save the generated card to database
      await supabase.from("business_cards").insert({
        athlete_id: user.id,
        template_id: template_id,
        design_id: designId,
        download_url: downloadUrl,
        preview_url: downloadUrl,
        template_name: "Custom Template",
        athlete_data: athlete_data,
        options: options,
      })

      return NextResponse.json({
        success: true,
        design_id: designId,
        download_url: downloadUrl,
        preview_url: downloadUrl,
      })
    } catch (canvaError: any) {
      console.error("Canva API error:", canvaError)
      return NextResponse.json(
        {
          error: "Failed to generate business card",
          details: canvaError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error generating business card:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
