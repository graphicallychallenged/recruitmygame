import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/utils/canva"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    console.log("Callback received - state:", state)

    if (error) {
      console.error("OAuth error:", error, searchParams.get("error_description"))
      return NextResponse.redirect(new URL("/dashboard/business-cards?error=oauth_failed", request.url))
    }

    if (!code || !state) {
      console.log("Missing code or state - code:", !!code, "state:", !!state)
      return NextResponse.redirect(new URL("/dashboard/business-cards?error=missing_params", request.url))
    }

    // Create a Supabase client
    const supabase = await createClient()

    console.log("Looking for state:", state)

    // Use RPC function to get OAuth state (bypasses RLS and gets most recent)
    const { data: rpcResult, error: rpcError } = await supabase.rpc("get_oauth_state", {
      user_id_param: state,
    })

    console.log("RPC result:", rpcResult)
    console.log("RPC error:", rpcError)

    if (rpcError || !rpcResult || rpcResult.length === 0) {
      console.error("Error retrieving OAuth state via RPC:", rpcError)
      return NextResponse.redirect(new URL("/dashboard/business-cards?error=state_not_found", request.url))
    }

    const codeVerifier = rpcResult[0].code_verifier

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier)

    // Store tokens using RPC function (bypasses RLS)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
    const { error: tokenError } = await supabase.rpc("store_canva_tokens", {
      user_id_param: state,
      access_token_param: tokens.access_token,
      refresh_token_param: tokens.refresh_token,
      expires_at_param: expiresAt.toISOString(),
      token_type_param: tokens.token_type,
      scope_param: tokens.scope,
    })

    if (tokenError) {
      console.error("Error storing tokens:", tokenError)
      return NextResponse.redirect(new URL("/dashboard/business-cards?error=token_storage_failed", request.url))
    }

    // Clean up OAuth state
    await supabase.from("canva_oauth_states").delete().eq("user_id", state)

    return NextResponse.redirect(new URL("/dashboard/business-cards?success=connected", request.url))
  } catch (error) {
    console.error("Error in Canva callback:", error)
    return NextResponse.redirect(new URL("/dashboard/business-cards?error=callback_failed", request.url))
  }
}
