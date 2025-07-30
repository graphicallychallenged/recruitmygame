import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { ComplianceManager } from "@/utils/compliance"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await (await supabase).auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { export_type = "full_export" } = body

    // Check if user already has a pending export
    const { data: existingExport } = await (await supabase)
      .from("data_exports")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["requested", "processing"])
      .single()

    if (existingExport) {
      return NextResponse.json({ error: "You already have a pending data export request" }, { status: 409 })
    }

    const exportRequest = await ComplianceManager.requestDataExport(user.id, export_type)

    if (!exportRequest) {
      return NextResponse.json({ error: "Failed to create export request" }, { status: 500 })
    }

    // Generate the export data immediately for this demo
    // In production, this would be handled by a background job
    try {
      const exportData = await ComplianceManager.generateDataExport(user.id)

      // Create a blob URL for download (in production, store in cloud storage)
      const dataBlob = JSON.stringify(exportData, null, 2)
      const fileName = `recruitmygame-data-export-${user.id}-${Date.now()}.json`

      // Update export record with completion
      await (await supabase)
        .from("data_exports")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          file_size: dataBlob.length,
        })
        .eq("id", exportRequest.id)

      return NextResponse.json({
        success: true,
        export_id: exportRequest.id,
        download_data: exportData,
        file_name: fileName,
      })
    } catch (error) {
      // Update export record with failure
      await (await supabase).from("data_exports").update({ status: "failed" }).eq("id", exportRequest.id)

      throw error
    }
  } catch (error) {
    console.error("Error in data export API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await (await supabase).auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: exports, error } = await (await supabase)
      .from("data_exports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ exports })
  } catch (error) {
    console.error("Error fetching data exports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
