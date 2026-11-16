"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, GraduationCap, CheckCircle2, UserCheck, Sparkles } from "lucide-react"

interface MuridDashboardContentProps {
  userId: string
  initialEnrollments?: any[]
  initialEvaluations?: any[]
}

export function MuridDashboardContent({
  userId,
  initialEnrollments,
  initialEvaluations,
}: MuridDashboardContentProps) {
  const [enrollments, setEnrollments] = useState<any[]>(initialEnrollments || [])
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>(initialEvaluations || [])
  const [isLoading, setIsLoading] = useState(!initialEnrollments && !initialEvaluations)
  const supabase = createClient()

  useEffect(() => {
    if (initialEnrollments && initialEvaluations) return

    async function fetchData() {
      const [enrollmentsRes, evaluationsRes] = await Promise.all([
        supabase
          .from("class_enrollments")
          .select("id, class:classes(name, guru:users(full_name))")
          .eq("user_id", userId),
        supabase
          .from("evaluations")
          .select("*, session:sessions(session_date)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data)
      if (evaluationsRes.data) setRecentEvaluations(evaluationsRes.data)
      setIsLoading(false)
    }

    fetchData()
  }, [userId, supabase, initialEnrollments, initialEvaluations])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
        Memuat data mutabaah...
      </div>
    )
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Tanggal tidak tersedia"
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return "Format tanggal salah"
    }
  }

  const formatLevel = (level: string) => {
    switch (level) {
      case "hafal_sangat_lancar":
        return { label: "Sangat Lancar (Mumtaz)", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200" }
      case "hafal_lancar":
        return { label: "Lancar (Jayyid Jiddan)", color: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200" }
      case "hafal_tidak_lancar":
        return { label: "Kurang Lancar", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200" }
      default:
        return { label: level ? level.replace(/_/g, " ") : "Perlu Murajaah", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200" }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kelas Saya */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Kelas Bimbingan</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Kelas tahfidz yang sedang diikuti</CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {enrollments.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-xl border-border text-muted-foreground text-sm">
                Belum terdaftar di kelas manapun.
              </div>
            ) : (
              enrollments.map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ق
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {enrollment.class?.name || "Kelas Tahfidz"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Ustaz: {enrollment.class?.guru?.full_name || "Pengajar"}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Aktif
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evaluasi Terakhir */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Evaluasi & Mutabaah</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Catatan setoran hafalan terbaru</CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <BookOpen className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvaluations.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-xl border-border text-muted-foreground text-sm">
                Belum ada evaluasi setoran yang tercatat.
              </div>
            ) : (
              recentEvaluations.map((evaluation: any) => {
                const levelInfo = formatLevel(evaluation.hafalan_level)
                return (
                  <div
                    key={evaluation.id}
                    className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground" suppressHydrationWarning>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(evaluation.session?.session_date || evaluation.created_at)}</span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${levelInfo.color}`}
                      >
                        {levelInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {evaluation.surah_name ? `Surah ${evaluation.surah_name}` : "Setoran Hafalan"}
                      </p>
                      {evaluation.verses_count ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          {evaluation.verses_count} Ayat
                        </span>
                      ) : null}
                    </div>

                    {evaluation.additional_notes && (
                      <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/40 italic">
                        "{evaluation.additional_notes}"
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
