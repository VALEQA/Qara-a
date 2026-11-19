# Panduan Setup — Qara-a (Mutabaah Online)

Dokumen ini menjelaskan cara menyiapkan database Supabase dan menjalankan aplikasi dari nol.

## Prasyarat

- Project Supabase sudah dibuat (cloud atau lokal).
- [Bun](https://bun.sh/) terpasang (disarankan), atau Node.js 18+.
- Aplikasi berjalan lokal atau di Vercel.

## 1. Inisialisasi Database Supabase

1. Buka dashboard Supabase → **SQL Editor**.
2. Jalankan `scripts/01_initial_schema.sql` — membuat enum, tabel, index, dan trigger dasar.
3. Jalankan `scripts/05_add_rls_policies.sql` — menambahkan kebijakan SELECT dasar (pengguna dapat membaca
   profilnya sendiri, institusi, semester, dan kelas).

### Ringkasan file database

| File | Isi |
| --- | --- |
| `scripts/01_initial_schema.sql` | Skema dasar: enum `user_role` / `attendance_status` / `evaluation_level`, tabel, index, trigger `updated_at`. |
| `scripts/02_seed_test_data.sql` | Data contoh: institusi, pengguna, semester, kelas, dan template evaluasi. |
| `scripts/03_create_test_accounts.sql` | Menghubungkan akun Supabase Auth ke tabel `users` (perlu UUID asli). |
| `scripts/05_add_rls_policies.sql` | Kebijakan RLS SELECT dasar. |
| `supabase/migrations/*.sql` | Migrasi incremental: gamifikasi, leaderboard, sistem poin, kolom `surah`, integrasi portal wali, dan perbaikan RLS. Dijalankan **setelah** skema dasar, berurutan sesuai nama file. |

Skrip lama `04`, `06`, `07`, `08` serta bundle `FULL_SETUP.sql` dan `FINAL_FIX_MIGRATIONS.sql` sudah dihapus:
isinya duplikat dari file di atas atau sudah digantikan oleh migrasi.

### Urutan eksekusi lengkap

```text
scripts/01_initial_schema.sql
scripts/02_seed_test_data.sql          (opsional — data contoh)
scripts/03_create_test_accounts.sql    (isi UUID dari Supabase Auth dulu)
scripts/05_add_rls_policies.sql
supabase/migrations/20260116141500_create_gamification_tables.sql
supabase/migrations/20260116143000_seed_badges.sql
supabase/migrations/20260116143500_leaderboard_schema.sql
supabase/migrations/20260116145000_fix_rls_recursion.sql
supabase/migrations/20260116164500_admin_badges_rls.sql
supabase/migrations/20260116171500_guru_session_rls.sql
supabase/migrations/20260116182000_guru_enrollment_visibility.sql
supabase/migrations/20260116183000_fix_guru_recursion.sql
supabase/migrations/20260116190000_seed_gamification_badges.sql
supabase/migrations/20260116191500_evaluations_rls.sql
supabase/migrations/20260116193000_seed_templates.sql
supabase/migrations/20260116213000_templates_rls.sql
supabase/migrations/20260201084500_fix_guru_attendance_rls.sql
supabase/migrations/20260201090000_add_surah_to_evaluations.sql
supabase/migrations/20260201091500_fix_subjects_rls.sql
supabase/migrations/20260201100000_scoring_system.sql
supabase/migrations/20260201110000_parent_integration.sql
```

> Migrasi RLS yang memperbaiki rekursi (`20260116145000` dan `20260116183000`) **wajib** dijalankan. Tanpa
> keduanya, policy yang saling merujuk ke tabel `users` menyebabkan error *infinite recursion detected in
> policy for relation*.

## 2. Membuat Akun Uji di Supabase Auth

### Opsi A — Manual (dashboard)

1. Buka **Authentication → Users**.
2. Klik **Add user** dan buat akun berikut (centang *Auto Confirm User*):

| Email | Password | Nama lengkap | Peran |
| --- | --- | --- | --- |
| `admin@tahfidz.test` | `Admin123456!` | Admin Tahfidz | `admin` |
| `guru@tahfidz.test` | `Guru123456!` | Ustaz Muhammad Ali | `guru` |
| `murid1@tahfidz.test` | `Murid123456!` | Ahmad Rizki | `murid` |
| `murid2@tahfidz.test` | `Murid123456!` | Fatimah Nur | `murid` |
| `murid3@tahfidz.test` | `Murid123456!` | Bilal Hakim | `murid` |
| `murid4@tahfidz.test` | `Murid123456!` | Aisha Rahman | `murid` |
| `murid5@tahfidz.test` | `Murid123456!` | Salman Bahri | `murid` |

3. Salin **UUID** setiap akun, lalu masukkan ke `scripts/03_create_test_accounts.sql`
   (ganti placeholder `REPLACE_WITH_*_UUID`) dan eksekusi.

### Opsi B — Otomatis (skrip)

```bash
bun run setup:accounts
```

Skrip `scripts/setup-accounts.ts` melakukan semuanya sekaligus memakai `SUPABASE_SERVICE_ROLE_KEY` dari
`.env.local`:

1. Membuat institusi `TAHFIDZ-001` bila belum ada.
2. Membuat akun di Supabase Auth (atau memakai yang sudah ada, dicari lewat email) — admin, guru,
   murid1–murid5, dan satu akun wali.
3. Menulis profil pasangannya ke tabel `users` memakai **UUID asli** dari Auth, jadi tidak perlu menyalin
   UUID manual.
4. Menautkan akun wali ke `murid1` lewat `parent_student_links`.

Skrip bersifat idempoten: dijalankan ulang akan memperbarui baris yang sudah ada, bukan menduplikasi.

```bash
bun run setup:accounts --force   # kalau ada baris users dengan email sama tapi UUID berbeda
```

Kalau tabel `users` sudah berisi email yang sama dengan UUID lain (biasanya sisa
`scripts/02_seed_test_data.sql`), skrip berhenti menyentuh akun itu dan mencetak perintah SQL untuk
membersihkannya. Flag `--force` menghapus baris placeholder tersebut — **hati-hati**: data anak yang
mereferensikannya (`class_enrollments`, `evaluations`, `attendance_records`) ikut terhapus lewat
`ON DELETE CASCADE`. Di database yang masih bersih, cukup jalankan skrip ini **sebelum** seed data.

## 3. Data Uji (Opsional)

Untuk mengisi institusi, kelas, dan evaluasi contoh:

1. Buka **SQL Editor**.
2. Jalankan isi `scripts/02_seed_test_data.sql`.

Data yang dibuat: institusi `Tahfidz Al-Qur'an Center` (kode `TAHFIDZ-001`), pengguna untuk semua peran,
semester, dua kelas halaqah, dan satu template evaluasi.

## 4. Environment Variables

Isi `.env.local` (salin dari `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_or_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Anon / publishable key. Aman dipakai di browser karena tetap dibatasi RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key. **Bypass RLS** — hanya untuk server dan skrip (`lib/supabase/admin.ts`, `scripts/*.ts`). Jangan pernah diekspos ke client. |

> Nama variabel anon key di proyek ini adalah `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, bukan
> `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Memakai nama lama akan membuat aplikasi gagal terhubung ke Supabase.

## 5. Menjalankan Aplikasi

```bash
bun install
bun run dev
```

Buka `http://localhost:3000` lalu login dengan akun demo.

## Menguji Tiap Peran

### Admin
- **Email:** `admin@tahfidz.test` — **Password:** `Admin123456!`
- **Akses:** dashboard admin untuk mengelola institusi, pengguna, struktur akademik, template evaluasi, dan
  lencana.

### Guru
- **Email:** `guru@tahfidz.test` — **Password:** `Guru123456!`
- **Akses:** dashboard guru untuk mengelola kelas, sesi halaqah, absensi, dan evaluasi santri.

### Santri (Murid)
- **Email:** `murid1@tahfidz.test` (atau `murid2` … `murid5`) — **Password:** `Murid123456!`
- **Akses:** dashboard santri untuk melihat poin, lencana, leaderboard, evaluasi, dan rapor PDF.

### Wali Santri (Orang Tua)
- Buat akun Auth dengan email apa pun, lalu set `role = 'orang_tua'` di tabel `users`.
- Hubungkan ke santri melalui tabel `parent_student_links` (`parent_id`, `student_id`, `institution_id`).
- **Akses:** portal wali untuk memantau kehadiran dan hafalan anak.

## Troubleshooting

### Error "Invalid login credentials"

Akun belum ada di Supabase Auth. Jalankan Opsi A atau Opsi B di bagian 2.

### Error "Could not fetch user details" / "User profile not found"

Akun ada di Auth tetapi tidak ada baris dengan `id` yang sama di tabel `users`. Perbaiki lewat
`scripts/03_create_test_accounts.sql` atau insert manual dengan UUID asli.

### Error "infinite recursion detected in policy"

Migrasi perbaikan RLS belum dijalankan. Eksekusi `20260116145000_fix_rls_recursion.sql` dan
`20260116183000_fix_guru_recursion.sql`.

### Error CORS atau koneksi

1. Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan key di `.env.local` benar.
2. Pastikan project Supabase aktif.
3. Pastikan RLS aktif di semua tabel dan policy untuk peran yang diuji sudah ada.

### Data tidak muncul padahal login berhasil

Hampir selalu masalah RLS: policy SELECT untuk peran tersebut belum mencakup baris yang diminta. Cek log
Supabase (Dashboard → Logs) untuk melihat policy mana yang menolak.

## Langkah Selanjutnya

1. Uji panel admin: buat kelas baru dan template evaluasi.
2. Uji panel guru: buka sesi, isi absensi, input evaluasi santri.
3. Uji panel santri: lihat evaluasi dan hasilkan rapor PDF.
4. Untuk produksi, lanjut ke [DEPLOYMENT.md](DEPLOYMENT.md).
