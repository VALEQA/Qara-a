# Panduan Deployment — Qara-a (Mutabaah Online)

## Ringkasan

Qara-a adalah Learning Management System untuk lembaga tahfidz yang siap dipakai di produksi. Stack
produksinya: **Next.js 16 di Vercel + Supabase** (PostgreSQL, Auth, dan Row Level Security).

## Prasyarat

- Akun [Vercel](https://vercel.com)
- Project [Supabase](https://supabase.com) (PostgreSQL sudah termasuk)
- Repository di GitHub/GitLab
- Bun (disarankan) atau Node.js 18+ untuk development lokal

## Langkah 1 — Setup Database

### 1.1 Buat project Supabase

1. Buat project baru di supabase.com.
2. Catat **Project URL** dan **anon/publishable key** (Settings → API).
3. Jalankan skema database lewat **SQL Editor**:

```text
scripts/01_initial_schema.sql
scripts/05_add_rls_policies.sql
supabase/migrations/*.sql        (berurutan sesuai nama file)
```

Urutan lengkap beserta nama tiap file ada di [SETUP.md](SETUP.md). Migrasi **wajib** dijalankan setelah skema
dasar — beberapa fitur (gamifikasi, sistem poin, portal wali) tidak akan berfungsi tanpanya.

### 1.2 Terapkan kebijakan RLS

Skema dasar hanya berisi policy minimal. Seluruh policy produksi ada di file migrasi `*_rls*.sql`. Contoh pola
yang dipakai:

```sql
-- Santri hanya bisa melihat evaluasinya sendiri
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (auth.uid() = user_id);
```

Prinsipnya: **setiap tabel ber-RLS dan punya policy eksplisit per peran.** Jangan mengandalkan penyaringan di
UI — RLS adalah lapisan keamanan yang sebenarnya.

> Perhatikan dua migrasi perbaikan rekursi (`20260116145000_fix_rls_recursion.sql`,
> `20260116183000_fix_guru_recursion.sql`). Policy yang saling merujuk ke tabel `users` tanpa keduanya akan
> memicu error *infinite recursion detected in policy*.

### 1.3 Buat akun admin pertama

Ikuti [AUTH_SETUP.md](AUTH_SETUP.md): buat akun di **Authentication → Users**, lalu masukkan profilnya ke tabel
`users` dengan UUID yang sama dan `role = 'admin'`.

## Langkah 2 — Environment Variables

### 2.1 Salin template

```bash
cp .env.example .env.local
```

### 2.2 Isi kredensial Supabase

Aplikasi hanya membaca **tiga** variabel berikut:

| Variabel | Sumber | Catatan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | Boleh terekspos ke browser. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Settings → API → anon / publishable key | Boleh terekspos; akses tetap dibatasi RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key | **Rahasia.** Bypass RLS. Hanya untuk server & skrip. |

> Nama variabel anon key di proyek ini adalah `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — bukan
> `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Memakai nama lama akan membuat aplikasi gagal terhubung.

## Langkah 3 — Uji Lokal

```bash
bun install
bun run dev          # http://localhost:3000
```

Sebelum deploy, pastikan keempat peran berfungsi:

- **Admin** — kelola institusi, pengguna, kelas, dan template evaluasi.
- **Guru** — buka sesi, isi absensi, input evaluasi santri.
- **Santri** — lihat poin, lencana, leaderboard, dan unduh rapor PDF.
- **Wali** — pantau progres anak.

Build produksi bisa diuji lebih dulu:

```bash
bun run build && bun run start
```

## Langkah 4 — Deploy ke Vercel

### 4.1 Hubungkan repository

1. Push kode ke GitHub/GitLab.
2. Buka vercel.com/new lalu pilih repository tersebut.
3. Vercel mendeteksi Next.js secara otomatis (framework preset: **Next.js**, build command `next build`).

### 4.2 Tambahkan environment variables

Di **Project Settings → Environment Variables**, tambahkan ketiga variabel dari Langkah 2 untuk environment
*Production* (dan *Preview* bila ingin preview deployment berfungsi):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Tandai `SUPABASE_SERVICE_ROLE_KEY` sebagai **Sensitive** agar tidak terbaca di log build.

### 4.3 Deploy

Klik **Deploy**. Setelah selesai, Vercel memberi domain `https://<project>.vercel.app`.

## Langkah 5 — Setelah Deploy

### 5.1 Verifikasi

1. Buka domain Vercel.
2. Login dengan akun admin produksi.
3. Uji keempat dashboard sesuai peran.
4. Pastikan tidak ada error 500 di **Vercel → Deployments → Functions → Logs**.

### 5.2 Setup data awal

1. Login sebagai admin.
2. Buat institusi (nama, kode, kontak, logo).
3. Tambahkan semester dan kelas halaqah.
4. Buat akun guru, santri, dan wali — untuk tiap akun, buat dulu di Supabase Auth lalu masukkan profilnya ke
   tabel `users` (lihat [AUTH_SETUP.md](AUTH_SETUP.md)).

### 5.3 Domain kustom

Di **Vercel → Settings → Domains**, tambahkan domain lalu ikuti instruksi DNS (biasanya record `A` atau
`CNAME`).

## Checklist keamanan

- [ ] Environment variables diisi di dashboard Vercel, tidak pernah di-commit ke repo.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` hanya ada di server (tidak pernah dipakai di komponen client).
- [ ] RLS aktif di **semua** tabel dan tiap peran punya policy eksplisit.
- [ ] Akun demo (`admin@tahfidz.test`, dst.) dihapus atau password-nya diganti di produksi.
- [ ] *Auto Confirm* dimatikan bila ingin verifikasi email wajib untuk pengguna baru.
- [ ] HTTPS aktif (otomatis di Vercel).
- [ ] Backup harian Supabase diaktifkan (Settings → Database → Backups).
- [ ] Rate limiting dipertimbangkan untuk endpoint publik seperti `/api/reports/generate-pdf`.

Header keamanan sudah diset di `next.config.mjs` dan berlaku untuk semua route:

| Header | Nilai |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

## Troubleshooting

### Autentikasi tidak berfungsi

1. Pastikan `NEXT_PUBLIC_SUPABASE_URL` benar dan tidak ada garis miring berlebih di akhir.
2. Pastikan key yang dipakai adalah anon/publishable, bukan service role, untuk variabel `NEXT_PUBLIC_*`.
3. Cek apakah akun sudah dikonfirmasi di Supabase Auth.

### Error koneksi database

1. Pastikan project Supabase tidak sedang *paused* (paket gratis pause setelah lama tidak aktif).
2. Uji dari SQL Editor Supabase — kalau di sana jalan, masalahnya di kredensial aplikasi.

### Evaluasi / absensi gagal disimpan

1. Cek policy INSERT/UPDATE untuk peran tersebut — pesan `permission denied for table ...` menandakan RLS.
2. Pastikan `user_id` yang dikirim sesuai pengguna yang login (`auth.uid()`).
3. Periksa log Supabase (Dashboard → Logs → API/Postgres).

### Error "infinite recursion detected in policy"

Migrasi perbaikan RLS belum dijalankan. Eksekusi `20260116145000_fix_rls_recursion.sql` dan
`20260116183000_fix_guru_recursion.sql`.

### Rapor PDF gagal dibuat

Endpoint `app/api/reports/generate-pdf/route.ts` membutuhkan sesi login yang valid dan akses baca ke data
santri serta institusi. Kalau balasannya 404 *"User not found"*, periksa kembali pemetaan UUID di tabel `users`.

## Optimasi performa

1. **Caching** — manfaatkan cache bawaan Next.js App Router untuk halaman yang datanya jarang berubah.
2. **Gambar** — `images.unoptimized` diset `true` di `next.config.mjs`, jadi optimasi gambar Vercel tidak
   dipakai; gunakan aset yang sudah dikompres (misalnya ikon PWA di `public/`).
3. **Database** — pastikan kolom yang sering difilter (`user_id`, `class_id`, `session_id`) sudah ter-index;
   sebagian besar sudah dibuat oleh skema awal dan migrasi.
4. **Bundle** — React Compiler aktif (`reactCompiler: true`), biarkan default-nya kecuali ada masalah build.

## Monitoring & perawatan

1. **Vercel** — pantau eksekusi function, error rate, dan waktu build.
2. **Supabase** — pantau kesehatan database, koneksi aktif, dan log RLS.
3. **Error tracking** — pertimbangkan Sentry untuk menangkap error runtime di produksi.
4. **Backup** — aktifkan backup harian dan uji proses restore secara berkala.

## Dukungan

- Bug & permintaan fitur: buka issue di repository GitHub.
- Gambaran sistem: [README.md](README.md).
- Setup database & akun: [SETUP.md](SETUP.md) dan [AUTH_SETUP.md](AUTH_SETUP.md).
