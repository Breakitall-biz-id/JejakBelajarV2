import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import type { CurrentUser } from "@/lib/auth/session"
import type { StudentDashboardData } from "../../queries"


import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectProgressBar } from "./project-progress-bar"


type ProjectCardProps = {
  project: StudentDashboardData["projects"][number]
  student: CurrentUser
  router: AppRouterInstance
}

export function ProjectCard({ project, router }: Omit<ProjectCardProps, "student">) {
  const status = project.status === "PUBLISHED"
    ? { label: "AKTIF", color: "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-white" }
    : project.status === "DRAFT"
    ? { label: "DRAFT", color: "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-white" }
    : { label: project.status, color: "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-white" }

  // Group stages by unique name (in case backend did not group)
  const groupedStagesMap = new Map<string, typeof project.stages[number]>()
  for (const stage of project.stages) {
    if (!groupedStagesMap.has(stage.name)) {
      groupedStagesMap.set(stage.name, stage)
    }
  }
  const groupedStages = Array.from(groupedStagesMap.values())
  const totalStages = groupedStages.length
  const groupCount = project.group ? 1 : 0
  const studentCount = project.group?.members?.length || 1
  const previewStages = groupedStages.slice(0, 2)
  const moreCount = totalStages - previewStages.length

  const progressProject = { ...project, stages: groupedStages }

  return (
    <Card className="w-full md:w-1/2 mb-6 shadow-sm border border-muted bg-card hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
              <h2 className="font-bold text-lg sm:text-xl leading-tight text-foreground break-words">{project.title}</h2>
              {project.theme && (
                <span className="text-background text-xs font-semibold rounded px-2 py-1 sm:px-3 sm:py-1 bg-primary mt-1 xs:mt-0">{project.theme}</span>
              )}
            </div>
          </div>
          <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${status.color} mt-2 sm:mt-0 w-fit`}>{status.label}</span>
        </div>
        <div className="border-b border-muted pb-3 mb-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block"><path d="M3 3h10v2H3zM3 7h10v2H3zM3 11h7v2H3z"/></svg> {totalStages} tahapan</span>
            <span className="inline-flex items-center gap-1"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block"><circle cx="8" cy="8" r="6"/><path d="M8 10a2 2 0 100-4 2 2 0 000 4z"/></svg> {groupCount} kelompok</span>
            <span className="inline-flex items-center gap-1"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block"><circle cx="8" cy="8" r="6"/><path d="M5.5 8a2.5 2.5 0 015 0v1a2.5 2.5 0 01-5 0V8z"/></svg> {studentCount} siswa</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/dashboard/student/project/${project.id}?tab=rapor`)}
              >
                📊 Lihat Rapor
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto mt-1 sm:mt-0 sm:ml-2"
                onClick={() => router.push(`/dashboard/student/project/${project.id}`)}
              >
                Lihat Detail
              </Button>
            </div>
          </div>
        </div>
        <ProjectProgressBar project={progressProject} />
        <div>
          <div className="text-xs sm:text-sm font-semibold mb-2 text-foreground">Tahapan Awal</div>
          <div className="flex items-center gap-2 mb-2">
            {moreCount > 0 && (
              <span className="ml-auto text-xs bg-muted border border-muted rounded-lg px-2 py-0.5 text-muted-foreground font-medium">+{moreCount} lagi</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {previewStages.map((stage, idx) => (
              <div key={stage.id} className="flex items-center gap-2 sm:gap-3 bg-muted rounded-lg px-2 sm:px-3 py-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full text-background font-bold text-xs sm:text-sm bg-primary">{idx + 1}</span>
                <span className="flex-1 text-xs sm:text-sm font-medium truncate text-foreground">{stage.name}</span>
                <span className="text-xs text-muted-foreground font-semibold">{stage.submissions?.length ?? 1}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}