import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GuruDashboardContent } from "@/components/guru/dashboard-content"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Users,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ArrowRight
} from "lucide-react"

export default async function GuruDashboardPage() {
  const { userData } = await getCurrentUserWithRole()
  const supabase = await createClient()

  // Fetch guru's classes
  const { data: classes } = await supabase
    .from("classes")
    .select("*, semester:semesters(name)")
    .eq("guru_id", userData.id)

  // Fetch today's sessions (Force Jakarta Timezone)
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })

  const { data: todaySessions } = await supabase
    .from("sessions")
    .select("*, class:classes(name)")
    .eq("guru_id", userData.id)
    .eq("session_date", today)

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Islamic Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 md:p-8 shadow-lg shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Panel Asatidz & Pembimbing</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Assalamu&apos;alaikum, Ustaz {userData.full_name} 👋
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl font-medium leading-relaxed">
              Selamat datang di portal pengelolaan tahfidz. Pantau kehadiran santri, catat setoran hafalan (Tajwid & Tartil), dan bimbing santri menggapai kemuliaan Al-Qur&apos;an.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <Link href="/guru/sessions">
              <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold shadow-xs">
                <PlusCircle className="w-4 h-4 mr-2 text-emerald-700" />
                Mulai Sesi Baru
              </Button>
            </Link>
            <Link href="/guru/progress">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold">
                <TrendingUp className="w-4 h-4 mr-2" />
                Input Setoran
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background ornament circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kelas Saya */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Kelas Bimbingan</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-foreground">
              {classes?.length || 0}
            </div>
            <Link
              href="/guru/classes"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
            >
              Kelola kelas bimbingan <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Sesi Hari Ini */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Sesi Hari Ini</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-foreground">
              {todaySessions?.length || 0}
            </div>
            <Link
              href="/guru/sessions"
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
            >
              Lihat jadwal & absensi <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Status Pengajar */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Status Pembimbing</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Aktif Mengajar
            </div>
            <p className="text-xs text-muted-foreground mt-1">Siap menguji & membimbing hafalan</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <GuruDashboardContent guruId={userData.id} />
    </div>
  )
}
