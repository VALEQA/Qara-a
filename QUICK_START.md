# Panduan Cepat — Menyiapkan Akun Uji

Panduan ini membuat empat jenis akun (admin, guru, santri, wali) yang bisa langsung dipakai login di
lingkungan lokal.

> Butuh setup database dari nol? Mulai dari [SETUP.md](SETUP.md) dulu, lalu kembali ke sini.

## Langkah 1 — Buat Akun di Supabase Auth

1. Buka dashboard Supabase project kamu.
2. Masuk ke **Authentication → Users**.
3. Klik **Add user** lalu buat akun berikut (centang *Auto Confirm User*):

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@tahfidz.test` | `Admin123456!` |
| Guru | `guru@tahfidz.test` | `Guru123456!` |
| Santri 1 | `murid1@tahfidz.test` | `Murid123456!` |
| Santri 2 | `murid2@tahfidz.test` | `Murid123456!` |
| Santri 3 | `murid3@tahfidz.test` | `Murid123456!` |
| Santri 4 | `murid4@tahfidz.test` | `Murid123456!` |
| Santri 5 | `murid5@tahfidz.test` | `Murid123456!` |

**Penting:** setelah tiap akun dibuat, salin **User UID (UUID)**-nya. UUID ini dibutuhkan di langkah 2 —
tanpa pencocokan UUID, login akan gagal dengan pesan *"User profile not found"*.

### Alternatif: buat lewat skrip

Jika `.env.local` sudah berisi `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`:

```bash
bun run setup:accounts
```

Skrip ini (`scripts/setup-accounts.ts`) hanya membuat **akun Supabase Auth** (admin, guru, murid1–murid3).
Profil di tabel `users` tetap harus diisi di langkah 2 — skrip tidak menulis ke tabel tersebut.

## Langkah 2 — Hubungkan ke Tabel `users`

Aplikasi menentukan peran pengguna dari tabel `users`, bukan dari metadata Supabase Auth. Jadi setiap akun Auth
harus punya baris dengan `id` yang **sama persis**.

### Opsi A — Skrip SQL (disarankan)

1. Buka **Supabase → SQL Editor**.
2. Jalankan berurutan (lewati yang sudah pernah dijalankan):
   - `scripts/01_initial_schema.sql` — skema dasar.
   - `scripts/02_seed_test_data.sql` — institusi, pengguna, kelas, dan template contoh.
   - `scripts/03_create_test_accounts.sql` — penghubung akun Auth ke tabel `users`.
3. Di `03_create_test_accounts.sql`, ganti setiap placeholder `REPLACE_WITH_*_UUID` dengan UUID asli dari
   langkah 1, lalu eksekusi.

### Opsi B — Manual lewat SQL Editor

```sql
INSERT INTO users (id, institution_id, email, full_name, role, created_at, updated_at)
VALUES (
  'UUID-DARI-SUPABASE-AUTH',
  (SELECT id FROM institutions LIMIT 1),
  'admin@tahfidz.test',
  'Admin Tahfidz',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

Ulangi untuk setiap akun dengan `role` yang sesuai: `admin`, `guru`, `murid`, atau `orang_tua`.

> **Catatan:** `02_seed_test_data.sql` mengisi tabel `users` dengan UUID contoh yang sudah ditentukan
> (`22222222-…` dan seterusnya). UUID tersebut **tidak akan cocok** dengan UUID Supabase Auth kamu, sehingga
> baris dari seed itu harus diperbarui — inilah fungsi langkah 3 di atas. Kalau ragu, hapus baris seed tersebut
> lalu masukkan ulang dengan UUID asli.

## Langkah 3 — Uji Login

1. Jalankan aplikasi: `bun run dev`
2. Buka `http://localhost:3000`
3. Klik tombol **"Demo Credentials for Testing"** di halaman login untuk mengisi email & password otomatis
   (kredensial demo di-hardcode di `app/auth/login/page.tsx`, hanya berisi admin, guru, murid1, dan murid2).
4. Klik **Login**.

Kamu akan diarahkan otomatis sesuai peran:

| Peran | Halaman tujuan |
| --- | --- |
| `admin` | `/admin/dashboard` |
| `guru` | `/guru/dashboard` |
| `murid` | `/murid/dashboard` |
| `orang_tua` | `/orang_tua/dashboard` |

## Troubleshooting

| Gejala | Penyebab & solusi |
| --- | --- |
| **"Could not fetch user details"** / **"User profile not found"** | Akun Auth ada, tapi belum ada baris dengan `id` yang sama di tabel `users`. Ulangi langkah 2 dengan UUID yang benar. |
| **"Invalid login credentials"** | Email/password tidak cocok, atau akun belum dibuat di **Authentication → Users**. Membuat baris di tabel `users` saja tidak cukup. |
| **"Cannot coerce the result to a single JSON object"** | Query ke tabel `users` mengembalikan 0 baris — sama seperti kasus di atas. |
| **"No institution found"** | Belum ada data institusi. Jalankan `scripts/02_seed_test_data.sql`. |
| Halaman kosong / data tidak muncul padahal login berhasil | Kebijakan RLS belum lengkap. Jalankan `scripts/05_add_rls_policies.sql` lalu migrasi `*_rls*.sql` di `supabase/migrations/`. |
| Error `permission denied` saat menulis data | `SUPABASE_SERVICE_ROLE_KEY` belum diisi di `.env.local`, atau policy INSERT/UPDATE untuk peran tersebut belum ada. |

## Langkah Selanjutnya

1. Login sebagai **admin** → kelola pengguna, semester, kelas, dan template evaluasi.
2. Login sebagai **guru** → buka sesi halaqah, isi absensi, dan nilai setoran hafalan.
3. Login sebagai **murid** → lihat poin, lencana, leaderboard, dan unduh rapor PDF.
4. Login sebagai **orang_tua** → pantau progres anak (perlu baris di `parent_student_links`, lihat
   migrasi `20260201110000_parent_integration.sql`).

Alur uji fitur absensi dan input hafalan secara rinci ada di [TESTING_GUIDE_ID.md](TESTING_GUIDE_ID.md).
