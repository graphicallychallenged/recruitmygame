import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"

  return NextResponse.json({
    ip_address: ip,
    user_agent: userAgent,
    timestamp: new Date().toISOString(),
  })
}
