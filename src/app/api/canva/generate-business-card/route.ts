import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const CANVA_API_BASE = "https://api.canva.com/rest/v1"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's Canva access token
    const { data: tokenData } = await supabase
      .from("canva_tokens")
      .select("access_token")
      .eq("user_id", user.id)
      .single()

    if (!tokenData) {
      return NextResponse.json({ error: "Canva not connected" }, { status: 401 })
    }

    // Get user's designs (templates they created)
    const response = await fetch(`${CANVA_API_BASE}/designs?design_type=BusinessCard&limit=50`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch templates")
    }

    const data = await response.json()

    // Format the templates for our use
    const templates = data.items.map((design: any) => ({
      id: design.id,
      name: design.title || "Untitled Template",
      preview_url: design.thumbnail?.url || null,
      canva_template_id: design.id,
      description: `Custom business card template`,
      created_at: design.created_at,
    }))

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error("Error fetching Canva templates:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
