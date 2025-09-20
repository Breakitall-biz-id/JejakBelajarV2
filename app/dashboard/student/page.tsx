import { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  ForbiddenError,
  getServerAuthSession,
  requireStudentUser,
  resolveDashboardPath,
} from "@/lib/auth/session"

import { getStudentDashboardData } from "./queries"
import { StudentDashboard } from "./_components/student-dashboard"

export const metadata: Metadata = {
  title: "Student Dashboard • JejakBelajar",
}

export default async function StudentDashboardPage() {
  let session

  try {
    session = await requireStudentUser()
  } catch (error) {
    if (error instanceof ForbiddenError) {
      const currentSession = await getServerAuthSession()

      if (!currentSession) {
        redirect("/sign-in")
      }

      redirect(resolveDashboardPath(currentSession.user.role))
    }

    throw error
  }

  const data = await getStudentDashboardData(session.user)

  return <StudentDashboard student={session.user} data={data} />
}
