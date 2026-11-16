import { createBrowserClient } from "@supabase/ssr"

const FALLBACK_URL = "https://dummy-qaraa.supabase.co"
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummyAnonKey"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || FALLBACK_KEY
  return createBrowserClient(url, key)
}
