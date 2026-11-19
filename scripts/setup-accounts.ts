/**
 * Membuat akun uji di Supabase Auth **dan** profil pasangannya di tabel `users`.
 *
 * Kenapa dua langkah: aplikasi menentukan peran pengguna dari tabel `users`
 * (lihat lib/auth-utils.ts), bukan dari metadata Supabase Auth. Akun Auth tanpa
 * baris di `users` dengan UUID yang sama akan gagal login dengan pesan
 * "User profile not found".
 *
 * Pemakaian:
 *   bun run setup:accounts            # buat akun + profil, konflik dilaporkan
 *   bun run setup:accounts --force    # hapus baris placeholder yang bentrok
 *
 * Butuh di .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY      (bypass RLS, jangan dipakai di client)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const FORCE = process.argv.includes("--force")

type Role = "admin" | "guru" | "murid" | "orang_tua"

// Proyek ini tidak memakai tipe database hasil generate, jadi skema tabel dibiarkan `any`.
type Db = SupabaseClient<any, any, any>

type TestAccount = {
  email: string
  password: string
  role: Role
  fullName: string
  phone?: string
  address?: string
  /** Untuk akun wali: email santri yang dipantau (dibuat di parent_student_links). */
  childEmail?: string
}

const INSTITUTION = {
  code: "TAHFIDZ-001",
  name: "Tahfidz Al-Qur'an Center",
  email: "info@tahfidztest.com",
  phone: "+62-21-1234567",
  address: "Jl. Pendidikan No. 123, Jakarta",
  description: "Test institutional account for Learning Management System",
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: "admin@tahfidz.test",
    password: "Admin123456!",
    role: "admin",
    fullName: "Admin Tahfidz",
    phone: "+62-812-3456789",
    address: "Jl. Admin, Jakarta",
  },
  {
    email: "guru@tahfidz.test",
    password: "Guru123456!",
    role: "guru",
    fullName: "Ustaz Muhammad Ali",
    phone: "+62-812-9876543",
    address: "Jl. Guru, Jakarta",
  },
  {
    email: "murid1@tahfidz.test",
    password: "Murid123456!",
    role: "murid",
    fullName: "Ahmad Rizki",
    phone: "+62-812-1111111",
    address: "Jl. Murid 1, Jakarta",
  },
  {
    email: "murid2@tahfidz.test",
    password: "Murid123456!",
    role: "murid",
    fullName: "Fatimah Nur",
    phone: "+62-812-2222222",
    address: "Jl. Murid 2, Jakarta",
  },
  {
    email: "murid3@tahfidz.test",
    password: "Murid123456!",
    role: "murid",
    fullName: "Bilal Hakim",
    phone: "+62-812-3333333",
    address: "Jl. Murid 3, Jakarta",
  },
  {
    email: "murid4@tahfidz.test",
    password: "Murid123456!",
    role: "murid",
    fullName: "Aisha Rahman",
    phone: "+62-812-4444444",
    address: "Jl. Murid 4, Jakarta",
  },
  {
    email: "murid5@tahfidz.test",
    password: "Murid123456!",
    role: "murid",
    fullName: "Salman Bahri",
    phone: "+62-812-5555555",
    address: "Jl. Murid 5, Jakarta",
  },
  {
    email: "wali@tahfidz.test",
    password: "Wali123456!",
    role: "orang_tua",
    fullName: "Bapak Ahmad",
    phone: "+62-812-6666666",
    address: "Jl. Wali, Jakarta",
    childEmail: "murid1@tahfidz.test",
  },
]

const summary = { created: 0, updated: 0, skipped: 0, failed: 0 }
const conflicts: { email: string; placeholderId: string; authUserId: string }[] = []

function fail(message: string): never {
  console.error(`\n❌ ${message}`)
  process.exit(1)
}

function isMissingEnumValue(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === "22P02" || /invalid input value for enum/i.test(error.message ?? "")
}

async function ensureInstitution(supabase: Db): Promise<string> {
  const { data: existing, error: selectError } = await supabase
    .from("institutions")
    .select("id")
    .eq("code", INSTITUTION.code)
    .maybeSingle()

  if (selectError) fail(`Gagal membaca tabel institutions: ${selectError.message}`)
  if (existing?.id) {
    console.log(`🏫 Institusi ${INSTITUTION.code} sudah ada (${existing.id})`)
    return existing.id as string
  }

  const { data: inserted, error: insertError } = await supabase
    .from("institutions")
    .insert(INSTITUTION)
    .select("id")
    .single()

  if (insertError || !inserted) {
    fail(`Gagal membuat institusi: ${insertError?.message ?? "tidak ada data dikembalikan"}`)
  }

  console.log(`🏫 Institusi ${INSTITUTION.code} dibuat (${inserted.id})`)
  return inserted.id as string
}

async function findAuthUserByEmail(
  supabase: Db,
  email: string,
): Promise<{ id: string } | null> {
  const perPage = 200
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) fail(`Gagal membaca daftar user Auth: ${error.message}`)

    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (found) return { id: found.id }
    if (data.users.length < perPage) return null
  }
  return null
}

async function ensureAuthUser(
  supabase: Db,
  account: TestAccount,
): Promise<string> {
  const existing = await findAuthUserByEmail(supabase, account.email)
  if (existing) {
    console.log(`   ↳ akun Auth sudah ada (${existing.id})`)
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.fullName, role: account.role },
  })

  if (error || !data.user) {
    fail(`Gagal membuat akun Auth ${account.email}: ${error?.message ?? "tidak ada user dikembalikan"}`)
  }

  console.log(`   ↳ akun Auth dibuat (${data.user.id})`)
  return data.user.id
}

async function ensureProfile(
  supabase: Db,
  account: TestAccount,
  authUserId: string,
  institutionId: string,
): Promise<void> {
  const { data: byEmail, error: lookupError } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", account.email)
    .maybeSingle()

  if (lookupError) fail(`Gagal membaca tabel users: ${lookupError.message}`)

  // Baris dengan email sama tapi UUID berbeda (mis. sisa seed placeholder).
  // Tidak bisa di-upsert: unique constraint pada email akan menolaknya.
  let replacedPlaceholder = false

  if (byEmail && byEmail.id !== authUserId) {
    if (!FORCE) {
      conflicts.push({ email: account.email, placeholderId: byEmail.id, authUserId })
      summary.skipped++
      console.log(
        `   ⚠️  konflik: users.email = ${account.email} terikat ke id ${byEmail.id}, ` +
          `bukan ${authUserId}. Jalankan ulang dengan --force untuk menggantinya.`,
      )
      return
    }

    const { error: deleteError } = await supabase.from("users").delete().eq("id", byEmail.id)
    if (deleteError) fail(`Gagal menghapus baris placeholder ${account.email}: ${deleteError.message}`)
    replacedPlaceholder = true
    console.log(`   ↳ baris placeholder ${byEmail.id} dihapus`)
  }

  const { error: upsertError } = await supabase.from("users").upsert(
    {
      id: authUserId,
      institution_id: institutionId,
      email: account.email,
      full_name: account.fullName,
      role: account.role,
      phone: account.phone ?? null,
      address: account.address ?? null,
    },
    { onConflict: "id" },
  )

  if (upsertError) {
    if (isMissingEnumValue(upsertError)) {
      fail(
        `Role '${account.role}' belum ada di enum user_role. ` +
          `Jalankan migrasi supabase/migrations/20260201110000_parent_integration.sql lebih dulu.`,
      )
    }
    fail(`Gagal menyimpan profil ${account.email}: ${upsertError.message}`)
  }

  if (replacedPlaceholder) {
    summary.created++
    console.log(`   ↳ profil users dibuat ulang dengan UUID Auth`)
  } else if (byEmail) {
    summary.updated++
    console.log(`   ↳ profil users diperbarui`)
  } else {
    summary.created++
    console.log(`   ↳ profil users dibuat`)
  }
}

async function linkParentToChild(
  supabase: Db,
  account: TestAccount,
  institutionId: string,
): Promise<void> {
  if (!account.childEmail) return

  const { data: rows, error } = await supabase
    .from("users")
    .select("id, email")
    .in("email", [account.email, account.childEmail])

  if (error) fail(`Gagal membaca users untuk relasi wali: ${error.message}`)

  const parentId = rows?.find((r) => r.email === account.email)?.id
  const studentId = rows?.find((r) => r.email === account.childEmail)?.id

  if (!parentId || !studentId) {
    console.log(`   ⚠️  relasi wali dilewati: profil ${account.email} atau ${account.childEmail} belum ada`)
    return
  }

  const { error: linkError } = await supabase.from("parent_student_links").upsert(
    { parent_id: parentId, student_id: studentId, institution_id: institutionId },
    { onConflict: "parent_id,student_id" },
  )

  if (linkError) {
    if (linkError.code === "42P01") {
      console.log(
        "   ⚠️  tabel parent_student_links belum ada — jalankan migrasi 20260201110000_parent_integration.sql",
      )
      return
    }
    fail(`Gagal menautkan wali ke santri: ${linkError.message}`)
  }

  console.log(`   ↳ wali ditautkan ke ${account.childEmail}`)
}

async function main() {
  if (!supabaseUrl || !serviceKey) {
    fail(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus ada di .env.local.\n" +
        "Salin .env.example menjadi .env.local lalu isi nilainya.",
    )
  }

  const supabase: Db = createClient(supabaseUrl, serviceKey)

  console.log("🚀 Menyiapkan akun uji (Auth + tabel users)\n")

  const institutionId = await ensureInstitution(supabase)

  for (const account of TEST_ACCOUNTS) {
    console.log(`\n👤 ${account.email} (${account.role})`)
    try {
      const authUserId = await ensureAuthUser(supabase, account)
      await ensureProfile(supabase, account, authUserId, institutionId)
      await linkParentToChild(supabase, account, institutionId)
    } catch (err) {
      summary.failed++
      console.error(`   ❌ ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log("\n" + "─".repeat(60))
  console.log(
    `Ringkasan: ${summary.created} profil dibuat, ${summary.updated} diperbarui, ` +
      `${summary.skipped} dilewati, ${summary.failed} gagal.`,
  )

  if (conflicts.length > 0) {
    console.log(
      `\n⚠️  ${conflicts.length} akun dilewati karena tabel users sudah berisi email yang sama ` +
        `dengan UUID berbeda (biasanya sisa scripts/02_seed_test_data.sql).\n` +
        `   Opsi 1 — jalankan ulang: bun run setup:accounts --force\n` +
        `   Opsi 2 — bersihkan manual di SQL Editor:\n`,
    )
    for (const { email, placeholderId, authUserId } of conflicts) {
      console.log(
        `   DELETE FROM public.users WHERE email = '${email}' AND id = '${placeholderId}';` +
          `  -- UUID Auth seharusnya: ${authUserId}`,
      )
    }
    console.log("\n   Perhatian: menghapus baris users ikut menghapus data anak yang mereferensikannya")
    console.log("   (class_enrollments, evaluations, attendance_records) lewat ON DELETE CASCADE.")
  }

  if (summary.failed > 0) process.exit(1)

  console.log("\n✨ Selesai. Akun siap dipakai login.\n")
}

main()
