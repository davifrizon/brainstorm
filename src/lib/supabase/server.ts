import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./client";

export { isSupabaseConfigured };

/**
 * Server-side Supabase client for use in Server Components, Route Handlers
 * and Server Actions. Returns `null` when env vars are not configured so
 * pages can render a friendly setup screen instead of crashing.
 */
export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context — safe to ignore,
            // middleware refreshes the session on the next request.
          }
        },
      },
    }
  );
}
