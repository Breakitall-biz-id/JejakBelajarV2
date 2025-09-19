import { Metadata } from "next"

import { instrumentTypeEnum, projectStatusEnum } from "@/db/schema/jejak"
import { requireTeacherUser } from "@/lib/auth/session"

import { getTeacherDashboardData } from "./queries"
import { TeacherDashboard } from "./_components/teacher-dashboard"

export const metadata: Metadata = {
  title: "Teacher Dashboard • JejakBelajar",
}

export default async function TeacherDashboardPage() {
  const session = await requireTeacherUser()
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
