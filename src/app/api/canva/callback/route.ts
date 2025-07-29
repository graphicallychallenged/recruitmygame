import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID
const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET
const CANVA_REDIRECT_URI = process.env.CANVA_REDIRECT_URI

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")
    const state = request.nextUrl.searchParams.get("state")
    const error = request.nextUrl.searchParams.get("error")

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recruityourgame.com"

    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(`${baseUrl}/dashboard/business-cards?error=authorization_failed`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/dashboard/business-cards?error=missing_parameters`)
    }

    const supabase = await createClient()

    // Get the stored PKCE verifier using the state (user_id)
    const { data: oauthState } = await supabase.from("canva_oauth_state").select("*").eq("user_id", state).single()

    if (!oauthState) {
      return NextResponse.redirect(`${baseUrl}/dashboard/business-cards?error=invalid_state`)
    }

    // Exchange code for access token using PKCE
    const tokenResponse = await fetch("https://api.canva.com/rest/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CANVA_CLIENT_ID!,
        client_secret: CANVA_CLIENT_SECRET!,
        code: code,
        redirect_uri: CANVA_REDIRECT_URI!,
        code_verifier: oauthState.code_verifier,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange failed:", errorData)
      return NextResponse.redirect(`${baseUrl}/dashboard/business-cards?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()

    // Store the token in your database
    await supabase.from("canva_tokens").upsert({
      user_id: state,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    })

    // Clean up OAuth state
    await supabase.from("canva_oauth_state").delete().eq("user_id", state)

    // Redirect back to business cards page with success
    return NextResponse.redirect(`${baseUrl}/dashboard/business-cards?success=connected`)
  } catch (error) {
    console.error("Error in Canva callback:", error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recruityourgame.com"
    return NextResponse.redirect(`${baseUrl}/dashboard/business-cards?error=connection_failed`)
  }
}
