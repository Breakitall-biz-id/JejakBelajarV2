"use client"

import { useRouter } from "next/navigation"

import type { CurrentUser } from "@/lib/auth/session"
import type { StudentDashboardData } from "../../queries"

import { ProjectCard } from "./project-card"

type StudentDashboardProps = {
  student: CurrentUser
  data: StudentDashboardData
}

export function StudentDashboard({ student, data }: StudentDashboardProps) {
  const router = useRouter()

  if (data.projects.length === 0) {
    return (
      <div className="px-4 pb-12 pt-6 lg:px-6">
        <div className="rounded-lg border bg-background p-8 text-center">
          <h1 className="text-xl font-semibold">No active projects</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are not currently assigned to a published project. Check back once your teacher
            activates a new project for this term.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-6 lg:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your Projects</h1>
        <p className="text-muted-foreground">
          Work through each project stage in order. Submit the required reflections and assessments
          to unlock the next steps of your PjBL journey.
        </p>
      </header>

      <div className="space-y-6">
        {data.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            student={student}
            router={router}
          />
        ))}
      </div>
    </div>
  )
}
