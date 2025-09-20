import { Metadata } from "next"
import { redirect } from "next/navigation"

import { instrumentTypeEnum, projectStatusEnum } from "@/db/schema/jejak"
import {
  ForbiddenError,
  getServerAuthSession,
  requireTeacherUser,
  resolveDashboardPath,
} from "@/lib/auth/session"

import { getTeacherDashboardData } from "./queries"
import { TeacherDashboard } from "./_components/teacher-dashboard"

export const metadata: Metadata = {
  title: "Teacher Dashboard • JejakBelajar",
}

export default async function TeacherDashboardPage() {
  let session

  try {
    session = await requireTeacherUser()
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

  const data = await getTeacherDashboardData(session.user)

  return (
    <TeacherDashboard
      teacher={session.user}
      data={data}
      projectStatusOptions={projectStatusEnum.enumValues}
      instrumentOptions={instrumentTypeEnum.enumValues}
    />
  )
}
