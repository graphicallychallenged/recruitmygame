import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { templateId, athleteData } = body

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's Canva token
    const { data: tokenData, error: tokenError } = await supabase
      .from("canva_tokens")
      .select("access_token, expires_at")
      .eq("user_id", user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "No Canva token found" }, { status: 404 })
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) <= new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    // Create a new design from template
    const createDesignResponse = await fetch("https://api.canva.com/rest/v1/designs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        design_type: "business_card",
        template_id: templateId,
      }),
    })

    if (!createDesignResponse.ok) {
      const errorText = await createDesignResponse.text()
      console.error("Failed to create design:", errorText)
      return NextResponse.json({ error: "Failed to create design" }, { status: 500 })
    }

    const designData = await createDesignResponse.json()

    // Store the business card in the database
    const { data: businessCard, error: dbError } = await supabase
      .from("business_cards")
      .insert({
        user_id: user.id,
        template_id: templateId,
        canva_design_id: designData.design.id,
        design_url: designData.design.urls.edit_url,
        status: "created",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Error storing business card:", dbError)
      return NextResponse.json({ error: "Failed to store business card" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      businessCard,
      editUrl: designData.design.urls.edit_url,
    })
  } catch (error) {
    console.error("Error generating business card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
