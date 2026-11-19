# Qara-a — Mutabaah Online

> Platform **Mutabaah Online** untuk institusi Tahfidz Al-Qur'an: absensi halaqah, penilaian setoran hafalan,
> gamifikasi poin & lencana, portal wali santri, dan rapor PDF — dibangun dengan Next.js + Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline--first-5A0FC8)
![License](https://img.shields.io/badge/license-Apache--2.0-blue)

---

## Daftar Isi

- [Ringkasan](#ringkasan)
- [Fitur per Peran](#fitur-per-peran)
- [Tech Stack](#tech-stack)
- [Alur Kerja Sistem](#alur-kerja-sistem)
- [Skema Database](#skema-database)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Setup Database](#setup-database)
- [Akun Demo](#akun-demo)
- [Sistem Poin & Lencana](#sistem-poin--lencana)
- [PWA & Offline Mode](#pwa--offline-mode)
- [Deployment](#deployment)
- [Dokumentasi Lain](#dokumentasi-lain)
- [Lisensi](#lisensi)

---

## Ringkasan

**Qara-a** adalah aplikasi web untuk mengelola kegiatan *mutabaah* (pemantauan ibadah dan hafalan harian) santri
di lembaga tahfidz. Sebelumnya proses ini biasanya dicatat di buku fisik: absensi halaqah, setoran hafalan,
nilai tajwid/tartil, dan rekap rapor. Qara-a memindahkan seluruh alur tersebut ke satu sistem terpusat yang bisa
diakses admin lembaga, ustaz/ustazah, santri, dan wali santri.

Yang membedakan Qara-a dari aplikasi absensi biasa:

- **Multi-role dengan isolasi data (RLS)** — setiap peran hanya bisa membaca data yang menjadi haknya,
  ditegakkan langsung di level database PostgreSQL, bukan hanya di UI.
- **Gamifikasi yang dihitung otomatis** — poin, total ayat, dan lencana dihitung oleh trigger database setiap
  kali evaluasi atau absensi dicatat, sehingga leaderboard selalu konsisten.
- **Portal wali santri** — orang tua dapat memantau progres anaknya tanpa perlu akun staf.
- **PWA offline-first** — dapat dipasang di HP dan tetap terbuka saat koneksi lembaga tidak stabil.

## Fitur per Peran

### Admin (Pengelola Lembaga)

| Fitur | Keterangan |
| --- | --- |
| Dashboard analitik | Ringkasan jumlah santri, kehadiran, dan tren setoran hafalan dalam grafik. |
| Manajemen pengguna | Tambah/ubah pengguna (admin, guru, santri, wali), atur peran dan penempatan kelas. |
| Struktur akademik | Kelola institusi, semester, kelas/halaqah, dan mata pelajaran (tajwid, tahfidz, tartil). |
| Template evaluasi | Buat template penilaian yang dipakai ustaz saat mengisi setoran. |
| Manajemen lencana | Lihat katalog lencana dan riwayat pemberiannya. |
| Pengaturan lembaga | Identitas, kontak, dan logo lembaga yang muncul di rapor PDF. |

### Guru / Ustaz

| Fitur | Keterangan |
| --- | --- |
| Dashboard guru | Statistik kelas yang diampu, rata-rata kehadiran, dan progres halaqah. |
| Sesi pembelajaran | Buka jadwal sesi halaqah harian, lihat riwayat sesi per kelas. |
| Absensi massal | Tandai kehadiran (`hadir` / `izin` / `sakit` / `alpa`) dengan aksi cepat "Mark All Hadir". |
| Input setoran hafalan | Nilai kelancaran hafalan, tajwid, dan tartil; catat surah, ayat, dan jumlah ayat. |
| Pelacakan progres | Lihat perkembangan tiap santri dari waktu ke waktu. |
| Manajemen kelas | Kelola anggota kelas dan pengaturan kelas yang diampu. |

### Santri / Murid

| Fitur | Keterangan |
| --- | --- |
| Dashboard santri | Poin, total ayat, lencana terbaru, dan grafik progres hafalan. |
| Riwayat evaluasi | Semua setoran yang pernah dinilai, lengkap dengan catatan ustaz. |
| Lencana & pencapaian | Galeri lencana yang sudah diraih beserta kriterianya. |
| Leaderboard | Peringkat santri berdasarkan poin. |
| Rapor PDF | Unduh rapor evaluasi berkala siap cetak. |
| Profil | Data pribadi dan informasi kelas. |

### Wali Santri (Orang Tua)

| Fitur | Keterangan |
| --- | --- |
| Portal wali | Pantau kehadiran, setoran hafalan, dan capaian lencana anak. |
| Multi-anak | Satu akun wali bisa terhubung ke beberapa santri. |
| Detail per anak | Halaman khusus per anak untuk melihat riwayat dan progresnya. |

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, React Compiler) |
| Bahasa | TypeScript 5 |
| Runtime & package manager | Bun (Node.js 18+ juga bisa untuk development) |
| Database & Auth | Supabase — PostgreSQL, Supabase Auth, Row Level Security |
| UI | Radix UI primitives, Tailwind CSS 4, Lucide React, Recharts |
| Form & validasi | React Hook Form + Zod |
| Notifikasi | Sonner / Toast |
| PWA | Web App Manifest + service worker (`public/sw.js`) |
| Analitik | Vercel Analytics |

## Alur Kerja Sistem

```
Admin menyiapkan lembaga  →  Ustaz membuka sesi & absensi  →  Ustaz menilai setoran
        │                              │                              │
        ▼                              ▼                              ▼
  semester, kelas,           attendance_records              evaluations (+ trigger)
  santri, template                                          poin, total ayat, lencana
                                                                       │
                                                                       ▼
                                                     Santri & wali melihat progres,
                                                     leaderboard, dan rapor PDF
```

1. **Setup lembaga & kelas** — Admin membuat semester, kelas tahfidz, dan mengelompokkan santri ke halaqah.
2. **Buka sesi & absensi** — Ustaz membuka jadwal sesi halaqah harian dan mencatat presensi.
3. **Input nilai setoran** — Ustaz menilai setoran ayat, makhraj/tajwid, dan kelancaran santri saat halaqah.
4. **Poin, lencana & rapor** — Santri langsung melihat poin dan lencananya, wali dapat memantau progres,
   dan rapor evaluasi dapat diunduh sebagai PDF.

## Skema Database

Tabel inti (dibuat oleh `scripts/01_initial_schema.sql`):

| Tabel | Fungsi |
| --- | --- |
| `institutions` | Data lembaga tahfidz (nama, kode, kontak, logo). |
| `users` | Profil pengguna + peran (`admin`, `guru`, `murid`, `orang_tua`), poin, total ayat. |
| `semesters` | Periode akademik per lembaga. |
| `classes` | Kelas / kelompok halaqah per semester. |
| `class_enrollments` | Relasi santri ↔ kelas, termasuk guru pengampu. |
| `subjects` | Mata pelajaran (tajwid, tahfidz, tartil, dst.). |
| `sessions` | Sesi halaqah (tanggal, kelas, guru). |
| `attendance_records` | Presensi santri per sesi (`hadir`, `izin`, `sakit`, `alpa`). |
| `evaluation_templates` | Template penilaian yang dipakai ustaz. |
| `evaluations` | Hasil setoran: level hafalan, tajwid, tartil, surah, jumlah ayat, catatan. |
| `pdf_templates` | Template rapor PDF per lembaga. |

Tabel tambahan (dibuat oleh migrasi di `supabase/migrations/`):

| Tabel | Fungsi |
| --- | --- |
| `badges` | Katalog lencana gamifikasi. |
| `user_badges` | Lencana yang sudah diraih tiap santri. |
| `parent_student_links` | Relasi akun wali ↔ santri yang dipantau. |

Semua tabel dilindungi **Row Level Security**. Kebijakan RLS ditambahkan bertahap lewat
`scripts/05_add_rls_policies.sql` dan migrasi `*_rls*.sql` — termasuk perbaikan rekursi policy
(`20260116145000_fix_rls_recursion.sql`, `20260116183000_fix_guru_recursion.sql`) yang penting untuk
menghindari *infinite recursion* saat policy saling merujuk ke tabel `users`.

## Struktur Proyek

```
app/
  page.tsx                    Landing page (redirect otomatis sesuai peran jika sudah login)
  auth/                       Login, error, dan server action autentikasi
  admin/                      Dashboard, users, academic, templates, badges, settings
  guru/                       Dashboard, classes, sessions, students, progress
  murid/                      Dashboard, evaluations, achievements, leaderboard, reports, profile
  orang_tua/                  Dashboard wali + detail per anak
  api/reports/generate-pdf/   Endpoint pembuatan rapor PDF
  actions/gamification.ts     Server action pemanggil pengecekan lencana
components/
  ui/                         Komponen dasar bergaya shadcn/ui (Radix + Tailwind)
  admin/ guru/ murid/ parent/ Komponen per peran
  gamification/               Kartu & daftar lencana
  analytics/                  Grafik progres santri (Recharts)
lib/
  supabase/                   Client browser, server, dan admin (service role)
  gamification.ts             Aturan pemberian lencana
  auth-utils.ts               Helper otorisasi & peran
scripts/                      SQL setup + skrip diagnostik/seed berbasis Node
supabase/migrations/          Migrasi incremental (schema, RLS, gamifikasi, scoring, portal wali)
public/                       Ikon, manifest PWA, service worker
```

## Menjalankan Secara Lokal

### Prasyarat

- [Bun](https://bun.sh/) (disarankan) atau Node.js 18+
- Project Supabase (cloud atau lokal)

### Instalasi

```bash
bun install
```

### Environment Variables

Salin `.env.example` menjadi `.env.local` lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<anon / publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

| Variabel | Dipakai untuk |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint project Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Anon key — dipakai client & server biasa, tetap tunduk pada RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Hanya untuk skrip administratif & pengecekan lencana.** Bypass RLS, jangan pernah diekspos ke browser. |

### Jalankan

```bash
bun run dev      # development
bun run build    # production build
bun run start    # jalankan hasil build
bun run lint     # ESLint
```

Buka `http://localhost:3000`.

## Setup Database

Urutan eksekusi di **Supabase SQL Editor**:

1. `scripts/01_initial_schema.sql` — enum, tabel, index, trigger dasar.
2. `scripts/02_seed_test_data.sql` — data awal: institusi, pengguna, kelas, template. *(opsional, untuk demo)*
3. `scripts/03_create_test_accounts.sql` — menghubungkan Supabase Auth user dengan tabel `users`.
4. `scripts/05_add_rls_policies.sql` — kebijakan SELECT dasar.
5. Seluruh file di `supabase/migrations/` **berurutan sesuai nama file** — memuat gamifikasi, leaderboard,
   sistem poin, kolom `surah` pada evaluasi, integrasi portal wali, dan perbaikan RLS.

> Skrip lama `04`, `06`, `07`, `08` serta bundle `FULL_SETUP.sql` / `FINAL_FIX_MIGRATIONS.sql` sudah dihapus:
> isinya duplikat dari file di atas atau sudah digantikan oleh migrasi. Detail lengkap ada di [SETUP.md](SETUP.md).

Setelah skema siap, buat akun di **Supabase → Authentication → Users**, lalu cocokkan UUID-nya di tabel `users`
(panduan langkah demi langkah: [AUTH_SETUP.md](AUTH_SETUP.md)). Pembuatan akun Auth bisa dibantu skrip:

```bash
bun run setup:accounts   # akun Auth + profil users + institusi + tautan wali
```

Skrip ini mengisi tabel `users` memakai UUID asli dari Auth, jadi tidak ada penyalinan UUID manual. Kalau
sebuah email sudah ada di `users` dengan UUID berbeda, skrip melaporkannya (dan `--force` menghapus baris
placeholder tersebut) — lihat [SETUP.md](SETUP.md).

## Akun Demo

Halaman login menyediakan tombol **"Demo Credentials for Testing"** untuk mengisi kredensial secara otomatis
(memerlukan data dari `02_seed_test_data.sql` + `03_create_test_accounts.sql`):

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@tahfidz.test` | `Admin123456!` |
| Guru (Ustaz) | `guru@tahfidz.test` | `Guru123456!` |
| Santri 1 | `murid1@tahfidz.test` | `Murid123456!` |
| Santri 2 | `murid2@tahfidz.test` | `Murid123456!` |

> Akun ini hanya untuk pengembangan lokal/demo. Ganti atau hapus sebelum dipakai di lingkungan produksi.

Alur uji fitur absensi & input hafalan langkah demi langkah tersedia di
[TESTING_GUIDE_ID.md](TESTING_GUIDE_ID.md).

## Sistem Poin & Lencana

**Poin dari evaluasi hafalan** (dihitung trigger `calculate_evaluation_points`):

| Level hafalan | Poin |
| --- | --- |
| `hafal_sangat_lancar` | 20 |
| `hafal_lancar` | 15 |
| `hafal_tidak_lancar` | 5 |
| `belum_hafal` | 0 |

**Poin dari kehadiran:** status `hadir` memberi **+5 poin**. Poin otomatis dikoreksi bila status absensi
diubah atau dihapus (trigger `update_user_points_on_attendance`), sehingga poin tidak pernah dobel.

**Lencana** dievaluasi di `lib/gamification.ts`:

| Slug | Nama | Kriteria |
| --- | --- | --- |
| `first-step` | Langkah Pertama | Mencatat setoran hafalan pertama. |
| `high-achiever` | Prestasi Tinggi | Menyelesaikan 10 setoran hafalan. |
| `hafal-juz-30` | Hafidz Juz 30 | Mencatat setoran dengan catatan "Juz 30". |
| `streak-7-days` | Rajin Mengaji (7 Hari) | Setoran hafalan 7 hari berturut-turut. |

## PWA & Offline Mode

- Manifest di `public/manifest.json` (`display: standalone`, tema `#0f172a`) dengan ikon 192px dan 512px.
- Service worker `public/sw.js` menyimpan aset inti sehingga halaman tetap terbuka saat offline.
- Landing page dan beberapa query utama memakai `try/catch` dengan *graceful fallback* agar tidak error
  ketika sesi Supabase tidak tersedia.

## Deployment

Target yang didukung: **Vercel + Supabase** (panduan lengkap di [DEPLOYMENT.md](DEPLOYMENT.md)).

Ringkasnya:

1. Import repo ini ke Vercel.
2. Set environment variables yang sama seperti `.env.local` di dashboard Vercel.
3. Pastikan skema database dan RLS sudah diterapkan di project Supabase produksi.
4. Deploy, lalu uji login untuk keempat peran.

Catatan keamanan: header `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, dan
`Referrer-Policy` sudah diset di `next.config.mjs`. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh ada di server.

## Dokumentasi Lain

| File | Isi |
| --- | --- |
| [QUICK_START.md](QUICK_START.md) | Panduan cepat membuat akun uji sampai bisa login, plus tabel troubleshooting. |
| [SETUP.md](SETUP.md) | Setup database lengkap: urutan eksekusi SQL + migrasi, akun Auth, env vars, troubleshooting per peran. |
| [AUTH_SETUP.md](AUTH_SETUP.md) | Menghubungkan Supabase Auth dengan tabel `users` (termasuk query pengecekan UUID). |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment ke Vercel + Supabase, checklist keamanan, dan troubleshooting produksi. |
| [TESTING_GUIDE_ID.md](TESTING_GUIDE_ID.md) | Panduan uji alur absensi dan input hafalan (Bahasa Indonesia). |

## Lisensi

Dirilis di bawah lisensi [Apache-2.0](LICENSE).
