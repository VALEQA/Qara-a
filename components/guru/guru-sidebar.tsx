import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  Users,
  CheckSquare,
  TrendingUp,
  Award
} from "lucide-react"

async function LogoutButton() {
  async function handleLogout() {
    "use server"
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient())
    await supabase.auth.signOut()
    const { redirect } = await import("next/navigation")
    redirect("/auth/login")
  }

  return (
    <form action={handleLogout} className="w-full">
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        type="submit"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Keluar Akun
      </Button>
    </form>
  )
}

export async function GuruSidebar() {
  const { userData } = await getCurrentUserWithRole()

  return (
    <aside className="w-64 border-r border-border/80 bg-sidebar flex flex-col h-screen sticky top-0 shadow-xs z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-xs">
        <Link href="/guru/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 font-bold text-xl group-hover:scale-105 transition-transform">
            ق
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">Qara-a</h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                Ustaz
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Panel Asatidz & Guru</p>
          </div>
        </Link>
      </div>

      {/* User Info Card */}
      <div className="p-3 mx-3 mt-3 mb-2 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
          {userData.full_name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{userData.full_name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <p className="text-[10px] text-muted-foreground font-medium truncate">Ustaz Pembimbing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Menu Pengajaran
        </div>

        <Link href="/guru/dashboard" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            <LayoutDashboard className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
            Dashboard
          </Button>
        </Link>

        <Link href="/guru/classes" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            <BookOpen className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
            Kelas Bimbingan
          </Button>
        </Link>

        <Link href="/guru/sessions" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            <CheckSquare className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
            Sesi & Absensi
          </Button>
        </Link>

        <Link href="/guru/students" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            <Users className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
            Daftar Santri
          </Button>
        </Link>

        <Link href="/guru/progress" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            <TrendingUp className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
            Progres Hafalan
          </Button>
        </Link>
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar">
        <LogoutButton />
      </div>
    </aside>
  )
}
