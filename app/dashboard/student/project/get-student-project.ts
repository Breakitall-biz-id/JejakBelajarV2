import { getStudentDashboardData } from "../queries"
import type { CurrentUser } from "@/lib/auth/session"

export async function getStudentProjectDetail(student: CurrentUser, projectId: string) {
  const dashboard = await getStudentDashboardData(student)
  return dashboard.projects.find((p) => p.id === projectId) || null
}
