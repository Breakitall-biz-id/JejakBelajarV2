import type { StudentDashboardData } from "../../queries"
import { Badge } from "@/components/ui/badge"

export function ProjectHeader({ project }: { project: StudentDashboardData["projects"][number] }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{project.title}</h2>
        <p className="text-sm text-muted-foreground">
          {project.class.name} • {project.class.academicYear} — Semester {project.class.semester}
        </p>
      </div>
      <Badge variant="outline" className="capitalize">
        {project.status.toLowerCase()}
      </Badge>
    </div>
  )
}
