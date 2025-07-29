import { type NextRequest, NextResponse } from "next/server"

// This would fetch available templates from Canva
export async function GET(request: NextRequest) {
  try {
    // Here you would fetch templates from Canva's API
    /*
    const canvaResponse = await fetch('https://api.canva.com/v1/templates?type=business_card', {
      headers: {
        'Authorization': `Bearer ${process.env.CANVA_API_KEY}`,
      }
    })

    const templates = await canvaResponse.json()
    */

    // For now, return mock templates
    const mockTemplates = [
      {
        id: "template_modern_1",
        name: "Modern Athletic",
        description: "Clean, modern design with bold typography",
        preview_url: "/placeholder.svg?height=200&width=350&text=Modern+Athletic",
        category: "modern",
        canva_id: "BAEoeNWyeUo",
      },
      {
        id: "template_classic_1",
        name: "Classic Professional",
        description: "Traditional business card layout",
        preview_url: "/placeholder.svg?height=200&width=350&text=Classic+Professional",
        category: "classic",
        canva_id: "BAEoeNWyeUp",
      },
      {
        id: "template_athletic_1",
        name: "Sports Focus",
        description: "Dynamic design highlighting athletic achievements",
        preview_url: "/placeholder.svg?height=200&width=350&text=Sports+Focus",
        category: "athletic",
        canva_id: "BAEoeNWyeUq",
      },
      {
        id: "template_minimal_1",
        name: "Minimal Clean",
        description: "Simple, elegant design with essential information",
        preview_url: "/placeholder.svg?height=200&width=350&text=Minimal+Clean",
        category: "minimal",
        canva_id: "BAEoeNWyeUr",
      },
    ]

    return NextResponse.json({ templates: mockTemplates })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}
