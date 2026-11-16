import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { BadgeList } from "@/components/gamification/badge-list"
import { getEarnedBadges, getAllBadges, checkBadges } from "@/lib/gamification"
import { Trophy, Sparkles, Award, Star } from "lucide-react"

export default async function AchievementsPage() {
    const { userData } = await getCurrentUserWithRole()

    // Trigger check on load
    await checkBadges(userData.id)

    // Fetch data
    const [allBadges, earnedBadges] = await Promise.all([
        getAllBadges(),
        getEarnedBadges(userData.id)
    ])

    const percent = allBadges.length > 0 ? Math.round((earnedBadges.length / allBadges.length) * 100) : 0

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/20 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                        <Trophy className="w-7 h-7 drop-shadow-xs" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                                Pencapaian & Lencana
                            </h1>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300">
                                {earnedBadges.length} Terbuka
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Apresiasi atas konsistensi dan hafalan Al-Qur&apos;an yang telah kamu selesaikan
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/80 shrink-0 shadow-xs">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground font-medium">Progres Koleksi</p>
                        <p className="text-lg font-extrabold text-foreground">{percent}%</p>
                    </div>
                    <div className="w-16 bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-linear-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Motivation card */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-xl flex items-center gap-3 text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                    Semakin sering kamu menyetorkan hafalan dan hadir tepat waktu, semakin banyak lencana kehormatan yang akan terbuka!
                </span>
            </div>

            {/* Badge Grid */}
            <BadgeList allBadges={allBadges} userBadges={earnedBadges} />
        </div>
    )
}
