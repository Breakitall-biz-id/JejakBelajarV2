"use client"

import { useRouter } from "next/navigation"

import type { CurrentUser } from "@/lib/auth/session"
import type { StudentDashboardData } from "../../queries"

import { ProjectCard } from "./project-card"
import { StudentDimensionScores } from "../student-dimension-scores"

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
          <h1 className="text-xl font-semibold">Tidak ada proyek aktif</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Anda belum ditugaskan ke proyek yang dipublikasikan. Periksa kembali setelah guru
            mengaktifkan proyek baru untuk semester ini.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-6 lg:px-6">

      {/* Overall Dimension Progress */}
      {data.projects.length > 0 && (
        <StudentDimensionScores
          student={student}
          projectId={data.projects[0].id}
        />
      )}

      <div className="space-y-6">
        {data.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            router={router}
          />
        ))}
      </div>
    </div>
  )
}
