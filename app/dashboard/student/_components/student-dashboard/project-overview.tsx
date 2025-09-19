import { BookOpen, PenLine, Users } from "lucide-react"

import type { CurrentUser } from "@/lib/auth/session"
import type { StudentDashboardData } from "../../queries"

type ProjectOverviewProps = {
  project: StudentDashboardData["projects"][number]
  student: CurrentUser
}

export function ProjectOverview({ project, student }: ProjectOverviewProps) {
  const studentGroup = project.group
  const peers = (studentGroup?.members ?? []).filter((member) => member.studentId !== student.id)

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {project.description && (
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4" />
          <span>{project.description}</span>
        </div>
      )}
      {project.theme && (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Theme: {project.theme}</span>
        </div>
      )}
      {studentGroup && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {studentGroup.name} • {peers.length} peer{peers.length === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </div>
  )
}
