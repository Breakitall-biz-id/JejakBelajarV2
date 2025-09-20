import { Metadata } from "next"

import { requireTeacherUser } from "@/lib/auth/session"

import { getTeacherReportData } from "./queries"
import { TeacherReportsDashboard } from "./_components/teacher-reports-dashboard"

export const metadata: Metadata = {
  title: "Class Reports • JejakBelajar",
}

export default async function TeacherReportsPage() {
  const session = await requireTeacherUser()
  const data = await getTeacherReportData(session.user)

  return (
    <div className="space-y-6 px-4 pb-12 pt-6 lg:px-6">
      <TeacherReportsDashboard data={data} />
    </div>
  )
}
