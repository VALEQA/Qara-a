import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminDashboardContent } from "@/components/admin/dashboard-content"
import { DashboardCharts } from "@/components/admin/dashboard-charts"
import Link from "next/link"
import {
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Building2,
  ArrowRight,
  Shield,
  Layers
} from "lucide-react"

export const metadata = {
  title: "Admin Dashboard | Qara-a",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default async function AdminDashboardPage() {
  const { userData } = await getCurrentUserWithRole()
  const supabase = await createClient()

  // Run all queries in parallel
  const [
    institutionRes,
    usersRes,
    classesRes,
    semesterRes
  ] = await Promise.all([
    supabase
      .from("institutions")
      .select("*")
      .eq("id", userData.institution_id)
      .maybeSingle(),

    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("institution_id", userData.institution_id),

    supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .eq("institution_id", userData.institution_id),

    supabase
      .from("semesters")
      .select("*")
      .eq("institution_id", userData.institution_id)
      .eq("is_active", true)
      .maybeSingle()
  ])

  const institution = institutionRes.data
  const usersCount = usersRes.count
  const classesCount = classesRes.count
  const activeSemester = semesterRes.data

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 md:p-8 shadow-lg shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Pusat Tata Kelola Institusi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {institution?.name || "Lembaga Tahfidz Al-Qur'an"}
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl font-medium leading-relaxed">
              Pantau seluruh aktivitas akademik, sebaran santri & asatidz, kurikulum tahfidz, serta status sistem secara real-time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 shrink-0 text-right">
            <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Kode Lembaga</p>
            <p className="text-2xl font-extrabold text-white tracking-wide mt-0.5">
              {institution?.code || "INST-001"}
            </p>
            <p className="text-[11px] text-emerald-100/80 mt-1">Status: Terverifikasi Aktif</p>
          </div>
        </div>

        {/* Decorative background ornament circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pengguna */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Pengguna</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-foreground">
              {usersCount ?? 0}
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
            >
              Kelola asatidz & santri <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Kelas Aktif */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Kelas Aktif</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-foreground">
              {classesCount ?? 0}
            </div>
            <Link
              href="/admin/academic"
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
            >
              Struktur kelas bimbingan <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Semester Aktif */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Semester Aktif</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-foreground truncate">
              {activeSemester?.name || "Semester Ganjil"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Periode akademik saat ini</p>
          </CardContent>
        </Card>

        {/* Status Sistem */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Status Sistem</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Operasional
            </div>
            <p className="text-xs text-muted-foreground mt-1">Layanan berjalan normal</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts />

      {/* Detail Content (Tables) */}
      <AdminDashboardContent institutionId={userData.institution_id} />
    </div>
  )
}
