// src/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // This is for Server Components / Route Handlers
// 'server-only' is generally for the App Router to prevent accidental client imports
// For pages router and middleware, the context implies server, but it's good practice
// import 'server-only'; // You can keep this or remove if it causes build issues with pages router

// This function creates a Supabase client for use in Server Components and Route Handlers (API routes)
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Correctly interact with the cookieStore object
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `cookies().set()` method can throw if called from a Server Component
            // that is in a tree that has a `redirect()` or `notFound()` call in it.
            // This is because the Server Component's response is already sealed.
            // For these cases, you can just ignore the error.
            console.warn('Could not set cookie from server component:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('Could not remove cookie from server component:', error);
          }
        },
      },
    }
  );
}