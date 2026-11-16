import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { createAdminClient } from "@/lib/supabase/admin"
import { Leaderboard } from "@/components/leaderboard"
import { Card, CardContent } from "@/components/ui/card"
import { Flame } from "lucide-react"

export default async function MuridLeaderboardPage() {
  const { userData } = await getCurrentUserWithRole()
  const adminClient = createAdminClient()

  // Fetch student classes
  const { data: enrollments } = await adminClient
    .from("class_enrollments")
    .select("class_id, class:classes(id, name)")
    .eq("user_id", userData.id)

  const activeClass = enrollments && enrollments.length > 0 ? (enrollments[0].class as any) : null

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 p-6 rounded-2xl bg-linear-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-orange-500/20 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
          <Flame className="w-7 h-7 drop-shadow-xs" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Peringkat Santri (Leaderboard)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Motivasi belajar dan berlomba-lomba dalam kebaikan (Fastabiqul Khairat)
          </p>
        </div>
      </div>

      {activeClass ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Kelas: {activeClass.name}
            </span>
          </div>
          <div className="min-h-[450px]">
            <Leaderboard classId={activeClass.id} />
          </div>
        </div>
      ) : (
        <Card className="border-border/80">
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum terdaftar di kelas manapun untuk menampilkan papan peringkat.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
