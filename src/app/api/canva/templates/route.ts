import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Predefined business card templates
const BUSINESS_CARD_TEMPLATES = [
  {
    id: "template-1",
    name: "Modern Athletic",
    description: "Clean, professional design with bold typography",
    canva_template_id: "DAFpY8H1wQs", // Replace with your actual Canva template ID
    preview_url: "/placeholder.svg?height=200&width=350&text=Modern+Athletic",
    category: "modern",
  },
  {
    id: "template-2",
    name: "Classic Sports",
    description: "Traditional business card layout with sports elements",
    canva_template_id: "DAFpY8H1wQt", // Replace with your actual Canva template ID
    preview_url: "/placeholder.svg?height=200&width=350&text=Classic+Sports",
    category: "classic",
  },
  {
    id: "template-3",
    name: "Bold Champion",
    description: "Eye-catching design with vibrant colors and dynamic layout",
    canva_template_id: "DAFpY8H1wQu", // Replace with your actual Canva template ID
    preview_url: "/placeholder.svg?height=200&width=350&text=Bold+Champion",
    category: "bold",
  },
  {
    id: "template-4",
    name: "Elite Athlete",
    description: "Premium design for high-level competitive athletes",
    canva_template_id: "DAFpY8H1wQv", // Replace with your actual Canva template ID
    preview_url: "/placeholder.svg?height=200&width=350&text=Elite+Athlete",
    category: "premium",
  },
]

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json(
        {
          error: "Canva authorization required",
          templates: BUSINESS_CARD_TEMPLATES, // Return predefined templates as fallback
        },
        { status: 401 },
      )
    }

    try {
      // Optionally fetch user's actual designs from Canva
      const designsResponse = await fetch("https://api.canva.com/rest/v1/designs?design_type=BusinessCard&limit=20", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (designsResponse.ok) {
        const designsData = await designsResponse.json()

        // Transform Canva designs to our template format
        const canvaTemplates =
          designsData.items?.map((design: any) => ({
            id: design.id,
            name: design.title || "Untitled Template",
            description: "Custom Canva template",
            canva_template_id: design.id,
            preview_url: design.thumbnail?.url || "/placeholder.svg?height=200&width=350&text=Custom+Template",
            category: "custom",
            created_at: design.created_at,
          })) || []

        // Combine predefined templates with user's Canva designs
        const allTemplates = [...BUSINESS_CARD_TEMPLATES, ...canvaTemplates]

        return NextResponse.json({
          success: true,
          templates: allTemplates,
        })
      } else {
        // If Canva API fails, return predefined templates
        return NextResponse.json({
          success: true,
          templates: BUSINESS_CARD_TEMPLATES,
        })
      }
    } catch (canvaError) {
      console.error("Error fetching Canva designs:", canvaError)
      // Return predefined templates as fallback
      return NextResponse.json({
        success: true,
        templates: BUSINESS_CARD_TEMPLATES,
      })
    }
  } catch (error: any) {
    console.error("Error in templates route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
