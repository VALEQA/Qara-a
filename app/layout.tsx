import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: "Qara-a | Platform Manajemen Lembaga Tahfidz & Al-Qur'an",
  description:
    "Sistem manajemen terpadu untuk institusi Tahfidz Al-Qur'an modern. Kelola setoran hafalan (Tajwid/Tartil), absensi santri, gamifikasi, dan cetak rapor resmi.",
  keywords: ["tahfidz", "quran", "qara-a", "lms", "mutabaah", "hafalan"],
  authors: [{ name: "Qara-a Tahfidz" }],
  creator: "Qara-a",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://qara-a.vercel.app",
    siteName: "Qara-a Tahfidz",
    title: "Qara-a | Platform Manajemen Lembaga Tahfidz & Al-Qur'an",
    description: "Sistem Manajemen Pembelajaran & Mutabaah Tahfidz Al-Qur'an Terpadu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qara-a Tahfidz",
    description: "Platform Manajemen Lembaga Tahfidz & Al-Qur'an Modern",
  },

  icons: {
    icon: [
      {
        url: "/icon-192x192.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-512x512.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon-512x512.png",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased text-sm md:text-base`}>
        {children}
        <Toaster />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('Service Worker registered with scope:', reg.scope))
                  .catch(err => console.error('Service Worker registration failed:', err));
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
