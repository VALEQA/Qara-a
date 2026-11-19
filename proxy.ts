import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * Proxy Next.js 16 (pengganti `middleware.ts`).
 *
 * Tugasnya hanya satu: menyegarkan sesi Supabase supaya cookie access token
 * tidak kedaluwarsa di tengah pemakaian. Otorisasi per peran tetap ditangani
 * `requireRole()` di masing-masing layout (app/<role>/layout.tsx), jadi tidak
 * ada redirect tambahan di sini.
 */
export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Jalankan untuk semua route kecuali aset statis dan file publik
  // (manifest PWA, service worker, ikon) — kalau tidak, auth ikut memblokir CSS/JS.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff|woff2|ttf)$).*)',
  ],
};
