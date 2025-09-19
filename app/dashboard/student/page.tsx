import { Metadata } from "next"

import { requireStudentUser } from "@/lib/auth/session"

import { getStudentDashboardData } from "./queries"
import { StudentDashboard } from "./_components/student-dashboard"

export const metadata: Metadata = {
  title: "Student Dashboard • JejakBelajar",
}

export default async function StudentDashboardPage() {
  const session = await requireStudentUser()
  const data = await getStudentDashboardData(session.user)

  return <StudentDashboard student={session.user} data={data} />
}
