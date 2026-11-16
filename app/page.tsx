import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  BookOpen,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Globe,
  Trophy,
  Users,
  Sparkles,
  GraduationCap,
  CalendarCheck,
  FileText,
  Flame,
  Award,
  Layers,
  HeartHandshake
} from "lucide-react"
import { FeatureChart, FastRecordingMock } from "@/components/landing-page-visuals"

export default async function HomePage() {
  let user = null
  let dashboardUrl = "/auth/login"

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const authUser = data?.user || null

    if (authUser) {
      user = authUser
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .maybeSingle()

      if (userData) {
        const redirectMap: Record<string, string> = {
          admin: "/admin/dashboard",
          guru: "/guru/dashboard",
          murid: "/murid/dashboard",
          orang_tua: "/orang_tua/dashboard",
        }
        dashboardUrl = redirectMap[userData.role] || "/auth/login"
      }
    }
  } catch {
    // Graceful fallback when offline
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Navbar */}
      <nav className="border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 font-bold text-xl group-hover:scale-105 transition-transform">
              ق
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-foreground">Qara-a</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                  Tahfidz
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">Platform Pendidikan Al-Qur&apos;an</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-emerald-600 transition-colors">Fitur Utama</Link>
            <Link href="#workflow" className="hover:text-emerald-600 transition-colors">Alur Sistem</Link>
            <Link href="#demo" className="hover:text-emerald-600 transition-colors">Akun Demo</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href={dashboardUrl}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs">
                  Ke Dashboard <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
                    Masuk
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs">
                    Coba Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-linear-to-b from-emerald-500/5 via-background to-background">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
          {/* Badge Tagline */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 mb-6 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Manajemen Halaqah & Mutabaah Tahfidz Modern</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground text-balance max-w-5xl mx-auto leading-[1.15]">
            Mencetak Generasi Qur&apos;ani dengan{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700">
              Tata Kelola Tahfidz Terpadu
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 text-balance leading-relaxed">
            Aplikasi mutabaah all-in-one untuk pondok pesantren, sekolah Islam, dan rumah tahfidz. Pantau setoran hafalan (Tajwid/Tartil), absensi halaqah, leaderboard santri, hingga cetak rapor resmi.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
            <Link href={user ? dashboardUrl : "/auth/login"}>
              <Button size="lg" className="h-12 px-7 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20">
                Mulai Gunakan Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base border-border/80 font-semibold hover:bg-muted/50">
                Lihat Akun Demo
              </Button>
            </Link>
          </div>

          {/* Hadith Quote Banner */}
          <div className="mt-12 max-w-xl mx-auto p-4 rounded-2xl bg-card border border-emerald-500/20 shadow-xs flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-lg">
              📖
            </div>
            <div>
              <p className="text-xs text-foreground font-semibold italic">
                &ldquo;Sebaik-baik kalian adalah orang yang belajar Al-Qur&apos;an dan mengajarkannya.&rdquo;
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">— HR. Al-Bukhari no. 5027</p>
            </div>
          </div>
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-border/70 bg-muted/20">
        <div className="container max-w-7xl mx-auto py-10 px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Santri Terdaftar", value: "5+ Akun Aktif", desc: "Data realistis siap uji" },
              { label: "Setoran Hafalan", value: "25+ Rekaman", desc: "Tajwid & Tartil tercatat" },
              { label: "Kurikulum Juz", value: "30 Juz Lengkap", desc: "Juz 28, 29, 30 & Surah Utama" },
              { label: "Kehandalan Sistem", value: "100% Real-Time", desc: "Supabase cloud postgres" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl">
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-foreground mt-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Demo Box */}
      <section id="demo" className="py-16 bg-background">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Akses Cepat Pengujian</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Coba Langsung Semua Peran
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Akun demo telah disiapkan dengan data lengkap agar Anda bisa mencoba alur dari sudut pandang Pengelola, Pengajar, dan Santri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Card Admin */}
            <div className="p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">1. Administrator</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Kelola struktur akademik, daftar kelas, asatidz, template rapor, dan manajemen lencana.
                </p>
                <div className="mt-4 p-2.5 rounded-lg bg-card border border-border/80 text-xs space-y-1 font-mono">
                  <p className="text-muted-foreground">Email: <span className="text-foreground font-semibold">admin@tahfidz.test</span></p>
                  <p className="text-muted-foreground">Pass: <span className="text-foreground font-semibold">Admin123456!</span></p>
                </div>
              </div>
              <Link href="/auth/login" className="mt-5">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
                  Login Sebagai Admin
                </Button>
              </Link>
            </div>

            {/* Card Guru */}
            <div className="p-5 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">2. Ustaz / Pembimbing</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Buka sesi halaqah harian, isi presensi santri, dan nilai setoran hafalan (Tajwid & Tartil).
                </p>
                <div className="mt-4 p-2.5 rounded-lg bg-card border border-border/80 text-xs space-y-1 font-mono">
                  <p className="text-muted-foreground">Email: <span className="text-foreground font-semibold">guru@tahfidz.test</span></p>
                  <p className="text-muted-foreground">Pass: <span className="text-foreground font-semibold">Guru123456!</span></p>
                </div>
              </div>
              <Link href="/auth/login" className="mt-5">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs">
                  Login Sebagai Ustaz
                </Button>
              </Link>
            </div>

            {/* Card Murid */}
            <div className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm mb-3">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">3. Santri / Siswa</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Lihat riwayat evaluasi setoran, cek papan peringkat, koleksi lencana, dan unduh rapor.
                </p>
                <div className="mt-4 p-2.5 rounded-lg bg-card border border-border/80 text-xs space-y-1 font-mono">
                  <p className="text-muted-foreground">Email: <span className="text-foreground font-semibold">murid1@tahfidz.test</span></p>
                  <p className="text-muted-foreground">Pass: <span className="text-foreground font-semibold">Murid123456!</span></p>
                </div>
              </div>
              <Link href="/auth/login" className="mt-5">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs">
                  Login Sebagai Santri
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-muted/10 border-t border-border/70">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Fitur Komprehensif</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mt-1">
              Dirancang Khusus untuk Lembaga Tahfidz
            </h2>
            <p className="text-base text-muted-foreground mt-2">
              Solusi digital lengkap dari pencatatan setoran halaqah harian hingga laporan evaluasi resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Analitik */}
            <Card className="md:col-span-2 border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold">Grafik Tren & Kemajuan Hafalan</CardTitle>
                <CardDescription className="text-sm">
                  Pantau kecepatan ziyadah (tambah hafalan) dan kualitas murajaah santri dalam grafik visual yang mudah dipahami oleh asatidz dan wali santri.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureChart />
              </CardContent>
            </Card>

            {/* Feature 2: Setoran Cepat */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold">Pencatatan Cepat</CardTitle>
                <CardDescription className="text-sm">
                  Ustaz dapat memilih surah, rentang ayat, dan kriteria tajwid hanya dengan beberapa ketukan di smartphone saat halaqah.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FastRecordingMock />
              </CardContent>
            </Card>

            {/* Feature 3: Gamifikasi */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold">Lencana & Poin (Fastabiqul Khairat)</CardTitle>
                <CardDescription className="text-sm">
                  Motivasi santri untuk istiqomah menghafal melalui sistem poin, streak mingguan, dan badge kehormatan juz.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: Cetak Rapor */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold">Generator Rapor PDF Resmi</CardTitle>
                <CardDescription className="text-sm">
                  Otomatisasi pembuatan buku rapor mutabaah berkop surat lembaga, siap ditandatangani dan dibagikan ke orang tua.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5: Multi-Peran */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold">Multi-Peran Terpadu</CardTitle>
                <CardDescription className="text-sm">
                  Hak akses terpisah dengan keamanan tingkat database (RLS) untuk Admin, Guru/Ustaz, Santri, dan Orang Tua.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-background border-t border-border/70">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Alur Kerja</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Mudah Dijalankan dalam 4 Langkah
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Alur terstruktur yang mempermudah koordinasi antara pimpinan lembaga, guru halaqah, dan para santri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Setup Lembaga & Kelas",
                desc: "Admin membuat semester, kelas tahfidz, dan mengelompokkan santri ke kelompok halaqah."
              },
              {
                step: "02",
                title: "Buka Sesi & Absensi",
                desc: "Ustaz membuka jadwal sesi halaqah harian dan mencatat presensi kehadiran santri."
              },
              {
                step: "03",
                title: "Input Nilai Setoran",
                desc: "Ustaz menilai setoran ayat, makhraj, dan kelancaran santri secara langsung saat halaqah."
              },
              {
                step: "04",
                title: "Poin, Lencana & Rapor",
                desc: "Santri langsung melihat poin dan lencananya, serta dapat mengunduh rapor evaluasi berkala."
              }
            ].map((wf, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/50 transition-colors">
                <span className="text-3xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30 block mb-2 font-mono">
                  {wf.step}
                </span>
                <h3 className="font-bold text-base text-foreground mb-1">{wf.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{wf.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/80 bg-card mt-auto">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md font-bold text-xl">
                ق
              </div>
              <div>
                <h4 className="font-bold text-lg text-foreground">Qara-a Tahfidz</h4>
                <p className="text-xs text-muted-foreground">Platform Manajemen Pendidikan Al-Qur&apos;an Modern</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
              <Link href="#features" className="hover:text-emerald-600 transition-colors">Fitur</Link>
              <Link href="#workflow" className="hover:text-emerald-600 transition-colors">Alur Sistem</Link>
              <Link href="#demo" className="hover:text-emerald-600 transition-colors">Akun Demo</Link>
              <Link href="/auth/login" className="hover:text-emerald-600 transition-colors">Login Portal</Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <p>&copy; {new Date().getFullYear()} Qara-a Tahfidz. Seluruh hak cipta dilindungi.</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Fastabiqul Khairat • Majukan Pendidikan Al-Qur&apos;an
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
