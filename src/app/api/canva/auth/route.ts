import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { generateCodeVerifier, generateCodeChallenge } from "@/utils/canva"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("Auth route - user:", user?.id)
    console.log("Auth route - userError:", userError)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    console.log("Auth route - generated code verifier:", codeVerifier.substring(0, 10) + "...")
    console.log("Auth route - user ID to store:", user.id)

    // Store the code verifier in the database
    const { data: insertData, error: stateError } = await supabase
      .from("canva_oauth_states")
      .upsert({
        user_id: user.id,
        code_verifier: codeVerifier,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })
      .select()

    console.log("Auth route - insert result:", insertData)
    console.log("Auth route - insert error:", stateError)

    if (stateError) {
      console.error("Error storing OAuth state:", stateError)
      return NextResponse.json({ error: "Failed to initialize OAuth" }, { status: 500 })
    }

    // Verify the data was stored
    const { data: verifyData, error: verifyError } = await supabase
      .from("canva_oauth_states")
      .select("*")
      .eq("user_id", user.id)

    console.log("Auth route - verification data:", verifyData)
    console.log("Auth route - verification error:", verifyError)

    // Determine redirect URI based on environment
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://recruitmygame.com/api/canva/callback"
        : "http://127.0.0.1:3000/api/canva/callback"

    // Build the authorization URL
    const authUrl = new URL("https://www.canva.com/api/oauth/authorize")
    authUrl.searchParams.set("client_id", process.env.CANVA_CLIENT_ID!)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "design:content:write design:meta:read asset:read")
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("code_challenge", codeChallenge)
    authUrl.searchParams.set("code_challenge_method", "S256")
    authUrl.searchParams.set("state", user.id)

    console.log("Auth route - final auth URL state parameter:", user.id)

    return NextResponse.json({ auth_url: authUrl.toString() })
  } catch (error) {
    console.error("Error in Canva auth:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
