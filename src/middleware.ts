// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip middleware entirely for placeholder.svg requests
  if (request.nextUrl.pathname === "/placeholder.svg") {
    return NextResponse.next()
  }

  // Skip middleware for Canva API routes
  if (request.nextUrl.pathname.startsWith("/api/canva/")) {
    return NextResponse.next()
  }

  // Skip middleware for ALL API routes including reviews
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  console.log("Middleware - Request URL:", request.url)
  console.log("Middleware - Pathname:", request.nextUrl.pathname)
  console.log("Middleware - Host:", request.headers.get("host"))

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // --- START: Wildcard Subdomain Logic ---
  const url = request.nextUrl
  const hostname = request.headers.get("host")

  let athleteName: string | null = null
  const VERCEL_URL = process.env.VERCEL_URL

  let baseDomain = "localhost:3000"
  if (VERCEL_URL) {
    try {
      const vercelUrlObj = new URL(VERCEL_URL.startsWith("http") ? VERCEL_URL : `https://${VERCEL_URL}`)
      baseDomain = vercelUrlObj.hostname
    } catch (e) {
      console.error("Error parsing VERCEL_URL:", VERCEL_URL, e)
      baseDomain = "yourdomain.com"
    }
  } else if (process.env.NODE_ENV === "production" && hostname) {
    const parts = hostname.split(".")
    if (parts.length > 2) {
      baseDomain = parts.slice(parts.length - 2).join(".")
    } else {
      baseDomain = hostname
    }
  }

  if (hostname && !hostname.includes(baseDomain)) {
    const parts = hostname.split(".")
    if (parts.length > 2) {
      athleteName = parts[0]
    } else if (parts.length === 2 && parts[0] !== "www" && parts[1] !== "com") {
      // Handle edge cases
    }
  } else if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
    athleteName = null
  }

  const reservedSubdomains = new Set(["www", "app", "api", "dashboard", "login", "auth", "admin"])

  if (athleteName && !reservedSubdomains.has(athleteName)) {
    console.log(`Middleware - Rewriting to /${athleteName}${url.pathname}`)
    url.pathname = `/${athleteName}${url.pathname}`
    return NextResponse.rewrite(url)
  }
  // --- END: Wildcard Subdomain Logic ---

  // Skip processing for specific routes
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname === "/"
  ) {
    // Handle auth for dashboard routes only
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.log("Middleware - Redirecting to login (no session)")
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    // Redirect authenticated users away from login
    if (request.nextUrl.pathname === "/login") {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        console.log("Middleware - Redirecting to dashboard (already logged in)")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
