import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const folder = formData.get("folder") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Use service role client to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split(".").pop()
    const fileName = `reviewer_${timestamp}_${randomId}.${fileExtension}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file using service role (bypasses RLS)
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error: any) {
    console.error("Upload exception:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
