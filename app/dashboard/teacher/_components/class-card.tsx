"use client"

import { BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "./project-card"

type ClassInfo = {
  id: string
  name: string
  academicYear: string
  semester: string
  termStatus: string
}

type Project = {
  id: string
  title: string
  description?: string | null
  theme?: string | null
  status: string
  stages: Array<any>
  groups: Array<any>
}

type ClassCardProps = {
  classInfo: ClassInfo
  projects: Project[]
  students: Array<any>
  projectStatusOptions: readonly string[]
  instrumentOptions: readonly string[]
  onCreateProject: (classId: string) => void
  onProjectStatusChange: (projectId: string, status: string) => void
  onProjectEdit: (project: Project) => void
  onProjectDelete: (projectId: string) => void
}

export function ClassCard({
  classInfo,
  projects,
  students,
  projectStatusOptions,
  onCreateProject,
  onProjectStatusChange,
  onProjectEdit,
  onProjectDelete,
}: ClassCardProps) {
  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{classInfo.name}</h3>
            <p className="text-sm text-muted-foreground">
              {classInfo.academicYear} • {classInfo.semester === "ODD" ? "Ganjil" : "Genap"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={classInfo.termStatus === "ACTIVE" ? "default" : "secondary"}>
              {classInfo.termStatus === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="font-medium">{projects.length}</span>
              <span className="text-muted-foreground ml-1">projects</span>
            </div>
            <div>
              <span className="font-medium">{students.length}</span>
              <span className="text-muted-foreground ml-1">students</span>
            </div>
          </div>
          <Button size="sm" onClick={() => onCreateProject(classInfo.id)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects */}
      <div className="p-6 space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">Belum Ada Proyek</h4>
            <p className="text-sm text-muted-foreground">
              Buat proyek pertama Anda untuk mulai mengelola aktivitas PjBL
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              classId={classInfo.id}
              students={students}
              projectStatusOptions={projectStatusOptions}
              instrumentOptions={[]} // Will be implemented later
              onStatusChange={onProjectStatusChange}
              onEdit={onProjectEdit}
              onDelete={onProjectDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}