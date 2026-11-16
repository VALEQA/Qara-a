import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { AcademicStructure } from "@/components/admin/academic-structure"

export default async function AdminAcademicPage() {
  const { userData } = await getCurrentUserWithRole()

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Struktur Akademik & Kelas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola semester aktif, kelas tahfidz, dan mata pelajaran mutabaah
        </p>
      </div>

      <AcademicStructure institutionId={userData.institution_id} />
    </div>
  )
}
