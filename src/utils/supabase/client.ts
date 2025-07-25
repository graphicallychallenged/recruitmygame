// src/utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

// This client is for use in Client Components (e.g., login.tsx, DashboardContent.tsx)
// and anywhere browser-side Supabase interactions are needed.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);