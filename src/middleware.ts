// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log("Middleware - Request URL:", request.url)
  console.log("Middleware - Pathname:", request.nextUrl.pathname)
  console.log("Middleware - Host:", request.headers.get('host')); // Log the host for debugging

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
  const url = request.nextUrl;
  const hostname = request.headers.get('host'); // e.g., "johndoe.yourdomain.com" or "localhost:3000"

  let athleteName: string | null = null;
  const VERCEL_URL = process.env.VERCEL_URL; // Get the base Vercel domain if deployed

  // Determine the base domain for stripping the subdomain
  // On Vercel, VERCEL_URL might be like "your-app-name.vercel.app" or your custom domain.
  // For local development, it's "localhost:3000"
  let baseDomain = 'localhost:3000'; // Default for local
  if (VERCEL_URL) {
    // If VERCEL_URL is set, it might include http/https.
    // We need to parse it to get just the hostname.
    try {
      const vercelUrlObj = new URL(VERCEL_URL.startsWith('http') ? VERCEL_URL : `https://${VERCEL_URL}`);
      baseDomain = vercelUrlObj.hostname;
    } catch (e) {
      console.error("Error parsing VERCEL_URL:", VERCEL_URL, e);
      // Fallback if VERCEL_URL is malformed
      baseDomain = 'yourdomain.com'; // Replace with your actual production domain
    }
  } else if (process.env.NODE_ENV === 'production' && hostname) {
    // Fallback for production if VERCEL_URL isn't perfectly set, use actual hostname
    // You'll need to configure your actual production domain here
    const parts = hostname.split('.');
    if (parts.length > 2) {
      baseDomain = parts.slice(parts.length - 2).join('.'); // e.g., 'yourdomain.com' from 'johndoe.yourdomain.com'
    } else {
      baseDomain = hostname; // e.g., 'yourdomain.com'
    }
  }


  if (hostname && !hostname.includes(baseDomain)) {
    // If the hostname contains a different subdomain part
    const parts = hostname.split('.');
    if (parts.length > 2) { // e.g., "johndoe.yourdomain.com" -> ["johndoe", "yourdomain", "com"]
      athleteName = parts[0];
    } else if (parts.length === 2 && parts[0] !== 'www' && parts[1] !== 'com') { // Handles cases like `yoursub.dev` if you have a dev domain
        // This case is tricky and depends on your exact domain structure.
        // For standard `yourdomain.com` it's usually parts.length >= 3 for a subdomain.
        // You might need to adjust this logic if your base domain itself is two parts like `example.co.uk`
    }
  } else if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
    // If it's the root domain or www, no athlete subdomain
    athleteName = null;
  }

  // Define common prefixes that are NOT athlete names
  const reservedSubdomains = new Set(['www', 'app', 'api', 'dashboard', 'login', 'auth', 'admin']);

  if (athleteName && !reservedSubdomains.has(athleteName)) {
    // If an athlete name is found and it's not a reserved subdomain,
    // rewrite the URL to your dynamic route: /[athleteName]/page
    console.log(`Middleware - Rewriting to /${athleteName}${url.pathname}`);
    url.pathname = `/${athleteName}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  // --- END: Wildcard Subdomain Logic ---


  // Get session for auth routes
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  // IMPORTANT: The pathname here will be the REWRITTEN pathname if a subdomain was matched.
  // So, if johndoe.yourdomain.com was rewritten to /johndoe/, then `request.nextUrl.pathname`
  // will be `/johndoe/` or `/johndoe/path`.
  // You need to adjust your auth logic accordingly.
  // For instance, if /dashboard is always a private area accessed via main domain or /app.yourdomain.com
  // and not via athleteName.yourdomain.com, then you might need more nuanced checks.

  // Current logic for dashboard protection:
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      console.log("Middleware - Redirecting to login (no session)")
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users away from login
  if (request.nextUrl.pathname === "/login" && session) {
    console.log("Middleware - Redirecting to dashboard (already logged in)")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Log dynamic route handling - this might now be less relevant as the rewrite happens before this
  // if (request.nextUrl.pathname.match(/^\/[a-zA-Z0-9_-]+$/)) {
  //   console.log("Middleware - Detected potential athlete profile route (after rewrite):", request.nextUrl.pathname)
  // }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any other public file in /public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}