import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { getCanvaAPI } from "@/utils/canva"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's Canva token
    const { data: tokenData, error: tokenError } = await supabase
      .from("canva_tokens")
      .select("access_token, expires_at")
      .eq("user_id", user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "No Canva connection found" }, { status: 401 })
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) <= new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    // Get user's designs from Canva API
    const canvaAPI = getCanvaAPI()
    const designs = await canvaAPI.getDesigns(tokenData.access_token, "BusinessCard")

    // Transform Canva designs into our template format
    const templates = designs.map((design) => ({
      id: design.id,
      name: design.title,
      description: `Business card template created ${new Date(design.created_at).toLocaleDateString()}`,
      canva_template_id: design.id,
      preview_url: design.thumbnail?.url || "/placeholder.svg?height=120&width=200&text=Business+Card",
      created_at: design.created_at,
    }))

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
