import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Menyegarkan sesi Supabase di setiap request yang lewat proxy (dulu: middleware).
 *
 * Pola ini mengikuti dokumentasi resmi @supabase/ssr untuk middleware/proxy:
 * cookie dibaca dari `request.cookies` dan ditulis ke response, bukan lewat
 * `cookies()` dari next/headers (API itu untuk Server Component & Server Action).
 *
 * `getUser()` dipakai — bukan `getSession()` — karena getUser memverifikasi token
 * ke server Auth dan menulis ulang cookie bila access token hampir kedaluwarsa.
 * getSession() hanya membaca cookie apa adanya, sehingga sesi bisa basi dan
 * pengguna tiba-tiba terlempar ke /auth/login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  // Tanpa env, jangan gagalkan seluruh request (mis. saat build/preview tanpa kredensial).
  if (!url || !key) {
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  try {
    await supabase.auth.getUser()
  } catch {
    // Jaringan/Auth bermasalah: biarkan halaman menangani sendiri lewat requireRole(),
    // yang akan redirect ke /auth/login bila memang tidak ada sesi.
  }

  return response
}
