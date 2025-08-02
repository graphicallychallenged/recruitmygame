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

  let athleteIdentifier: string | null = null

  // Fixed base domain detection for recruitmygame.com
  let baseDomain = "recruitmygame.com"
  if (process.env.NODE_ENV === "development") {
    baseDomain = "localhost:3000"
  }

  console.log("Middleware - Base domain:", baseDomain)
  console.log("Middleware - Current hostname:", hostname)

  // Extract subdomain if present
  if (hostname) {
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
      // Main domain, no subdomain
      athleteIdentifier = null
    } else if (hostname.endsWith(`.${baseDomain}`)) {
      // Extract subdomain
      const subdomain = hostname.replace(`.${baseDomain}`, "")
      if (subdomain && subdomain !== "www") {
        athleteIdentifier = subdomain
      }
    }
  }

  const reservedSubdomains = new Set(["www", "app", "api", "dashboard", "login", "auth", "admin"])

  if (athleteIdentifier && !reservedSubdomains.has(athleteIdentifier)) {
    console.log(`Middleware - Processing subdomain: ${athleteIdentifier}`)

    try {
      // Check if this is a custom subdomain first
      const { data: athleteBySubdomain, error: subdomainError } = await supabase
        .from("athletes")
        .select("username")
        .eq("subdomain", athleteIdentifier)
        .eq("is_profile_public", true)
        .single()

      if (athleteBySubdomain) {
        console.log(`Middleware - Found custom subdomain match: ${athleteIdentifier} -> ${athleteBySubdomain.username}`)
        url.pathname = `/${athleteBySubdomain.username}${url.pathname}`
        return NextResponse.rewrite(url)
      }

      console.log(`Middleware - No custom subdomain found, checking username: ${athleteIdentifier}`)

      // Fall back to username-based routing
      const { data: athleteByUsername, error: usernameError } = await supabase
        .from("athletes")
        .select("username, subdomain")
        .eq("username", athleteIdentifier)
        .eq("is_profile_public", true)
        .single()

      if (athleteByUsername) {
        // If this athlete has a custom subdomain set, don't allow username access
        if (athleteByUsername.subdomain && athleteByUsername.subdomain !== athleteIdentifier) {
          console.log(
            `Middleware - Athlete ${athleteIdentifier} has custom subdomain ${athleteByUsername.subdomain}, blocking username access`,
          )
          return NextResponse.next() // Let it fall through to 404
        }

        console.log(`Middleware - Found username match: ${athleteIdentifier}`)
        url.pathname = `/${athleteIdentifier}${url.pathname}`
        return NextResponse.rewrite(url)
      }

      console.log(`Middleware - No athlete found for subdomain: ${athleteIdentifier}`)
    } catch (error) {
      console.error("Middleware - Error checking subdomain:", error)
    }
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
