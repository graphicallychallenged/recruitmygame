import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getCanvaAccessToken } from "@/utils/canva"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await (await supabase).auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)

    // Extract parameters - the frontend sends template_id and athlete_data
    const { template_id, athlete_data } = body

    if (!template_id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    if (!athlete_data?.name) {
      return NextResponse.json({ error: "Athlete name is required" }, { status: 400 })
    }

    // Get the user's Canva access token
    const accessToken = await getCanvaAccessToken(user.id)

    if (!accessToken) {
      return NextResponse.json({ error: "Canva not connected" }, { status: 401 })
    }

    const title = `${athlete_data.name} Business Card`
    console.log("Duplicating design from template ID:", template_id)

    // *** CRITICAL CORRECTION: 'design_type' is an object containing 'type' and 'name' ***
    // For duplicating a template, 'type' should be 'preset' and 'name' should be the specific design type.
    const designTypeObject = {
      type: "preset", // Indicates a known Canva design type
      name: "BusinessCard", // The specific name of the design type (e.g., "BusinessCard", "Card", "Presentation")
    }

    const createResponse = await fetch(`https://api.canva.com/rest/v1/designs/${template_id}/duplicate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        design_type: designTypeObject, // Pass the object here
      }),
    })

    const createData = await createResponse.text()
    console.log("Create API response:", createData)

    if (!createResponse.ok) {
      console.log("Create failed:", createData)
      throw new Error(`Failed to create design: ${createData}`)
    }

    const design = JSON.parse(createData)

    // Store the generated business card in the database
    const { error: insertError } = await (await supabase).from("business_cards").insert({
      user_id: user.id,
      canva_design_id: design.id,
      template_id: template_id,
      title: title,
      canva_url: design.urls?.view_url || null,
    })

    if (insertError) {
      console.error("Error storing business card:", insertError)
      // Don't fail the request if we can't store it
    }

    return NextResponse.json({
      success: true,
      design: design,
      canva_url: design.urls?.view_url,
    })
  } catch (error) {
    console.error("Error generating business card:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate business card" },
      { status: 500 },
    )
  }
}