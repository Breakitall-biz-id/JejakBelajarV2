import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

import { Badge } from "@/components/ui/badge"

import type { CurrentUser } from "@/lib/auth/session"
import type { StudentDashboardData } from "../../queries"

import { ProjectOverview } from "./project-overview"
import { StagePanel } from "./stage-panel"

type ProjectCardProps = {
  project: StudentDashboardData["projects"][number]
  student: CurrentUser
  router: AppRouterInstance
}

export function ProjectCard({ project, student, router }: ProjectCardProps) {
  return (
    <div className="rounded-lg border border-muted bg-background">
      <div className="space-y-2 border-b p-6">
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
        <ProjectOverview project={project} student={student} />
      </div>

      <div className="space-y-6 p-6">
        {project.stages.map((stage, index) => (
          <StagePanel
            key={stage.id}
            stage={stage}
            index={index}
            totalStages={project.stages.length}
            student={student}
            projectId={project.id}
            groupMembers={project.group?.members ?? []}
            router={router}
          />
        ))}
      </div>
    </div>
  )
}
