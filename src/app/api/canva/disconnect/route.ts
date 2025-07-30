import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
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

    // Delete the user's Canva tokens
    const { error: deleteError } = await supabase.from("canva_tokens").delete().eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting Canva tokens:", deleteError)
      return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
    }

    // Also clean up any OAuth states
    await supabase.from("canva_oauth_states").delete().eq("user_id", user.id)

    return NextResponse.json({ success: true, message: "Successfully disconnected from Canva" })
  } catch (error: any) {
    console.error("Error disconnecting from Canva:", error)
    return NextResponse.json({ error: error.message || "Failed to disconnect" }, { status: 500 })
  }
}
