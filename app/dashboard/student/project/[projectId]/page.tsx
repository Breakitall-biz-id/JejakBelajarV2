
import { getStudentDashboardData } from "../../queries"
import { ProjectDetail } from "../../_components/student-dashboard/project-detail"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"

export default async function ProjectDetailPage(props: { params: Promise<{ projectId: string }> }) {
  const { params } = props
  const { projectId } = await params
  const user = await getCurrentUser()
  if (!user) return notFound()

  const data = await getStudentDashboardData(user)
  const project = data.projects.find(p => p.id === projectId)
  if (!project) return notFound()

  return <ProjectDetail project={project} student={user} />
}
