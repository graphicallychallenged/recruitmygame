import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's consent preferences
    const { data: consents, error: consentsError } = await supabase
      .from("data_processing_consents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (consentsError) {
      console.error("Error fetching consents:", consentsError)

      // If table doesn't exist, return default consents
      if (consentsError.code === "42P01") {
        const defaultConsents = [
          {
            id: "temp-essential",
            user_id: user.id,
            consent_type: "essential",
            purpose: "Essential functionality and security",
            granted: true,
            granted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "temp-analytics",
            user_id: user.id,
            consent_type: "analytics",
            purpose: "Website analytics and performance monitoring",
            granted: false,
            granted_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "temp-marketing",
            user_id: user.id,
            consent_type: "marketing",
            purpose: "Marketing communications and personalized content",
            granted: false,
            granted_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "temp-third-party",
            user_id: user.id,
            consent_type: "third_party",
            purpose: "Third-party integrations and services",
            granted: false,
            granted_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

        return NextResponse.json({ consents: defaultConsents })
      }

      return NextResponse.json({ error: "Failed to fetch consents" }, { status: 500 })
    }

    // If no consents exist, create default ones
    if (!consents || consents.length === 0) {
      const defaultConsents = [
        {
          user_id: user.id,
          consent_type: "essential",
          purpose: "Essential functionality and security",
          granted: true,
          granted_at: new Date().toISOString(),
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        },
        {
          user_id: user.id,
          consent_type: "analytics",
          purpose: "Website analytics and performance monitoring",
          granted: false,
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        },
        {
          user_id: user.id,
          consent_type: "marketing",
          purpose: "Marketing communications and personalized content",
          granted: false,
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        },
        {
          user_id: user.id,
          consent_type: "third_party",
          purpose: "Third-party integrations and services",
          granted: false,
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        },
      ]

      const { data: newConsents, error: insertError } = await supabase
        .from("data_processing_consents")
        .insert(defaultConsents)
        .select()

      if (insertError) {
        console.error("Error creating default consents:", insertError)
        // Return the default consents even if we can't save them
        return NextResponse.json({
          consents: defaultConsents.map((consent, index) => ({
            ...consent,
            id: `temp-${index}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        })
      }

      return NextResponse.json({ consents: newConsents })
    }

    return NextResponse.json({ consents })
  } catch (error) {
    console.error("Unexpected error in consent API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { consent_type, granted, purpose } = body

    if (!consent_type || typeof granted !== "boolean") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const consentData = {
      user_id: user.id,
      consent_type,
      purpose: purpose || `Consent for ${consent_type}`,
      granted,
      granted_at: granted ? new Date().toISOString() : null,
      withdrawn_at: !granted ? new Date().toISOString() : null,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    }

    const { data: consent, error: upsertError } = await supabase
      .from("data_processing_consents")
      .upsert(consentData, {
        onConflict: "user_id,consent_type",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (upsertError) {
      console.error("Error updating consent:", upsertError)
      return NextResponse.json({ error: "Failed to update consent" }, { status: 500 })
    }

    // Log the consent change
    try {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: granted ? "consent_granted" : "consent_withdrawn",
        resource_type: "data_processing_consent",
        resource_id: consent.id,
        new_values: { consent_type, granted },
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })
    } catch (auditError) {
      console.error("Error logging consent change:", auditError)
      // Don't fail the main operation if audit logging fails
    }

    return NextResponse.json({ consent })
  } catch (error) {
    console.error("Unexpected error in consent update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
