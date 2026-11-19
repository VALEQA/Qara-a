# Panduan Setup Autentikasi

## Memahami masalahnya

Sistem ini memakai **Supabase Auth** (autentikasi terkelola) yang dipasangkan dengan **tabel `users` milik
aplikasi** (data profil dan peran). Saat pengguna login:

1. Supabase Auth memverifikasi email & password, lalu mengembalikan **user ID (UUID)**.
2. Aplikasi mencari baris dengan `id` yang sama di tabel `users` untuk mengambil `role` dan `institution_id`.
3. Jika baris itu tidak ada, muncul error **"User profile not found"** dan pengguna tidak bisa masuk.

Artinya: **membuat akun di Supabase Auth saja tidak cukup.** Harus ada baris pasangannya di tabel `users`
dengan UUID yang identik.

## Setup langkah demi langkah

### 1. Buat institusi lebih dulu (opsional, tapi disarankan)

```sql
INSERT INTO institutions (id, name, code, email, phone, address)
VALUES (
  gen_random_uuid(),
  'Tahfidz Al-Qur''an Center',
  'TAHFIDZ-001',
  'info@tahfidz.local',
  '021-1234567',
  'Jakarta, Indonesia'
)
RETURNING id;
```

Salin UUID yang dikembalikan — itu `institution_id` yang akan dipakai di langkah 3.

### 2. Buat akun di Supabase Auth

1. Buka dashboard Supabase → **Authentication → Users**.
2. Klik **Add user**, isi:
   - Email: `admin@tahfidz.test`
   - Password: `Admin123456!`
   - Centang **Auto Confirm User** (kalau tidak, email konfirmasi akan dikirim dan login bisa gagal).
3. Klik user tersebut untuk melihat **UUID**-nya (ada di detail user atau URL).
4. Salin UUID tersebut.

### 3. Masukkan profil ke tabel `users`

Ganti `YOUR_UUID_HERE` dan `YOUR_INSTITUTION_UUID` dengan nilai asli, lalu jalankan di SQL Editor:

```sql
INSERT INTO users (id, email, full_name, role, institution_id, created_at, updated_at)
VALUES (
  'YOUR_UUID_HERE',
  'admin@tahfidz.test',
  'Admin Tahfidz',
  'admin',
  'YOUR_INSTITUTION_UUID',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    institution_id = EXCLUDED.institution_id,
    updated_at = NOW();
```

`ON CONFLICT ... DO UPDATE` membuat perintah ini aman dijalankan berulang — kalau baris sudah ada, isinya
diperbarui, bukan error.

### 4. Uji login

- Email: `admin@tahfidz.test`
- Password: `Admin123456!`

Setelah login sebagai admin, kamu bisa membuat akun guru, santri, dan wali dari menu **Admin → Users**
(atau mengulang langkah 2–3 untuk tiap peran).

## Contoh lengkap

```sql
-- 1. Buat institusi
INSERT INTO institutions (id, name, code, email, phone, address, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Tahfidz Al-Qur''an',
  'TAHFIDZ-001',
  'info@tahfidz.local',
  '+62-21-1234567',
  'Jakarta',
  NOW(),
  NOW()
)
ON CONFLICT (code) DO NOTHING;

-- 2. Setelah akun dibuat di Supabase Auth, masukkan profilnya.
--    Ganti ketiga UUID di bawah dengan UUID asli dari Authentication → Users.
INSERT INTO users (id, email, full_name, role, institution_id, phone, address, created_at, updated_at)
VALUES
  ('AAAAAAAA-0000-0000-0000-000000000001', 'admin@tahfidz.test',  'Admin Tahfidz',       'admin',  '11111111-1111-1111-1111-111111111111', '+62-21-1111111', 'Jakarta', NOW(), NOW()),
  ('AAAAAAAA-0000-0000-0000-000000000002', 'guru@tahfidz.test',   'Ustaz Ali',           'guru',   '11111111-1111-1111-1111-111111111111', '+62-21-2222222', 'Jakarta', NOW(), NOW()),
  ('AAAAAAAA-0000-0000-0000-000000000003', 'murid@tahfidz.test',  'Ahmad Rizki',         'murid',  '11111111-1111-1111-1111-111111111111', '+62-21-3333333', 'Jakarta', NOW(), NOW()),
  ('AAAAAAAA-0000-0000-0000-000000000004', 'wali@tahfidz.test',   'Bapak Ahmad',         'orang_tua', '11111111-1111-1111-1111-111111111111', '+62-21-4444444', 'Jakarta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

> Nilai `AAAAAAAA-0000-…` di atas hanyalah placeholder agar formatnya valid. UUID asli harus disalin dari
> Supabase Auth — UUID tidak bisa dikarang, karena Auth memverifikasi kecocokannya saat login.

## Poin penting

| Aspek | Aturan |
| --- | --- |
| **UUID** | Harus **sama persis** antara Supabase Auth dan tabel `users`. Ini penyebab error paling umum. |
| **Peran (`role`)** | Salah satu dari `admin`, `guru`, `murid`, `orang_tua` (huruf kecil semua). `orang_tua` ditambahkan oleh migrasi `20260201110000_parent_integration.sql`. |
| **`institution_id`** | Boleh `NULL` untuk admin, **wajib** untuk guru, murid, dan wali. |
| **Email** | Sebaiknya sama dengan yang dipakai di Supabase Auth agar mudah ditelusuri. |
| **Auto Confirm** | Akun yang belum dikonfirmasi tidak bisa login meskipun password-nya benar. |

## Troubleshooting

### Error "User profile not found"

- UUID akun tidak ada di tabel `users`, atau tersalin salah.
- Cek: `SELECT id, email, role FROM users WHERE email = 'admin@tahfidz.test';`
- Bandingkan hasilnya dengan UUID di **Authentication → Users**.

### Error "Cannot coerce the result to a single JSON object"

- Query mengembalikan 0 baris — penyebabnya sama seperti di atas: profil belum ada di tabel `users`.

### Error "Authentication failed" / "Invalid login credentials"

- Email atau password salah.
- Akun belum dibuat di Supabase Auth (baris di tabel `users` saja tidak cukup).
- Email belum dikonfirmasi — buat ulang dengan *Auto Confirm User*, atau konfirmasi manual di dashboard.

### Login berhasil tapi dashboard kosong / error 42501 (`permission denied`)

- Kebijakan RLS untuk peran tersebut belum ada. Jalankan `scripts/05_add_rls_policies.sql` lalu seluruh
  migrasi `*_rls*.sql` di `supabase/migrations/` sesuai urutan nama file.

### Ingin melihat semua akun Auth sekaligus

```sql
SELECT au.id, au.email, au.email_confirmed_at, u.role, u.full_name
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
ORDER BY au.created_at;
```

Baris dengan `role` bernilai `NULL` adalah akun Auth yang **belum** punya profil — itulah yang perlu
diperbaiki lebih dulu.
