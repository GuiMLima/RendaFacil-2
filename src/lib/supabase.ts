import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** False until both Supabase variables are set in `.env`. */
export const isSupabaseConfigured = Boolean(url && publishableKey)

let client: SupabaseClient<Database> | undefined

/**
 * The shared Supabase client. It is created on first use rather than at import
 * time, so the app still boots while the credentials are missing.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env, then restart the dev server.',
    )
  }

  client ??= createClient<Database>(url, publishableKey)
  return client
}
