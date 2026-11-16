import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MuridDashboardContent } from "@/components/murid/dashboard-content"
import { BadgeList } from "@/components/gamification/badge-list"
import { getEarnedBadges, getAllBadges } from "@/lib/gamification"
import { Leaderboard } from "@/components/leaderboard"
import { StudentProgressChart } from "@/components/analytics/student-progress-chart"
import Link from "next/link"
import {
  ArrowRight,
  Trophy,
  GraduationCap,
  BookMarked,
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2
} from "lucide-react"

async function LatestBadges({ userId }: { userId: string }) {
  const [allBadges, earnedBadges] = await Promise.all([
    getAllBadges(),
    getEarnedBadges(userId)
  ])

  return (
    <div className="space-y-4">
      <BadgeList allBadges={allBadges} userBadges={earnedBadges} compact />

      <Link
        href="/murid/achievements"
        className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline pt-2"
      >
        Lihat semua koleksi lencana ({earnedBadges.length}/{allBadges.length}) <ArrowRight className="w-4 h-4 ml-1.5" />
      </Link>
    </div>
  )
}

export default async function MuridDashboardPage() {
  const { userData } = await getCurrentUserWithRole()
  const adminClient = createAdminClient()

  // Fetch student's classes safely with admin client
  const { data: enrollments } = await adminClient
    .from("class_enrollments")
    .select("id, class_id, class:classes(id, name, guru:users(full_name), semester:semesters(name))")
    .eq("user_id", userData.id)

  // Fetch recent evaluations
  const { data: recentEvals } = await adminClient
    .from("evaluations")
    .select("*, session:sessions(session_date)")
    .eq("user_id", userData.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const latestEval = recentEvals?.[0]
  const activeClassId = enrollments && enrollments.length > 0 ? enrollments[0].class_id : null

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Islamic Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 md:p-8 shadow-lg shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Portal Santri & Tahfidz</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Ahlan wa Sahlan, {userData.full_name} 👋
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl font-medium leading-relaxed">
              &ldquo;Sebaik-baik kalian adalah orang yang belajar Al-Qur&apos;an dan mengajarkannya.&rdquo;
              <span className="block text-xs text-emerald-200/70 mt-1 italic font-normal">— HR. Al-Bukhari</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-right shrink-0">
            <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Total Poin Hafalan</p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <Trophy className="w-6 h-6 text-amber-300 drop-shadow-xs" />
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {userData.points || 0}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 mt-1">Rajin setoran untuk raih lencana baru!</p>
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
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-foreground">
              {enrollments?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {enrollments && enrollments.length > 0
                ? `${enrollments.length} kelas tahfidz aktif diikuti`
                : "Belum terdaftar di kelas"}
            </p>
          </CardContent>
        </Card>

        {/* Evaluasi Terakhir */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Evaluasi Terakhir</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-foreground truncate">
              {latestEval ? (latestEval.surah_name ? `Surah ${latestEval.surah_name}` : "Tercatat") : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
              {latestEval
                ? `Setoran pada ${new Date(latestEval.session?.session_date || latestEval.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
                : "Belum ada evaluasi setoran"}
            </p>
          </CardContent>
        </Card>

        {/* Poin & Prestasi */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow bg-linear-to-br from-amber-500/5 to-orange-500/10 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Poin & Prestasi
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-700 dark:text-amber-400">
              {userData.points || 0} Poin
            </div>
            <Link
              href="/murid/leaderboard"
              className="text-xs text-amber-700 dark:text-amber-300 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
            >
              Cek posisi di Peringkat Santri <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Charts, Detail, and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StudentProgressChart userId={userData.id} />
          <MuridDashboardContent
            userId={userData.id}
            initialEnrollments={enrollments || []}
            initialEvaluations={recentEvals || []}
          />
        </div>

        <div className="space-y-6">
          {/* Leaderboard Widget */}
          {activeClassId && (
            <div className="h-[380px]">
              <Leaderboard classId={activeClassId} />
            </div>
          )}

          {/* Badges Widget */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Pencapaian Terbaru</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Lencana hafalan yang telah diraih</CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <LatestBadges userId={userData.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
