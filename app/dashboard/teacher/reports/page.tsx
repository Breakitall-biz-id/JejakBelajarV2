import { Metadata } from "next"

import { requireTeacherUser } from "@/lib/auth/session"

import { getTeacherReportData } from "./queries"
import { TeacherReportsDashboard } from "./_components/teacher-reports-dashboard"

export const metadata: Metadata = {
  title: "Laporan Kelas • JejakBelajar",
}

export default async function TeacherReportsPage() {
  const session = await requireTeacherUser()

  try {
    const data = await getTeacherReportData(session.user)

    return (
      <div className="space-y-6 px-4 pb-12 pt-6 lg:px-6">
        <TeacherReportsDashboard data={data || { classes: [], generatedAt: new Date().toISOString() }} />
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6 px-4 pb-12 pt-6 lg:px-6">
        <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Tidak dapat memuat laporan</h3>
          <p className="text-sm text-muted-foreground">Terjadi kesalahan saat memuat data laporan. Silakan coba lagi nanti.</p>
        </div>
      </div>
    )
  }
}
