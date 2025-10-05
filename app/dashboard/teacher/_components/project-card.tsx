"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown, MoreHorizontal, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Project = {
  id: string
  title: string
  description?: string | null
  theme?: string | null
  status: string
  stages: Array<any>
  groups: Array<any>
}

type ProjectCardProps = {
  project: Project
  classId: string
  students: Array<any>
  projectStatusOptions: readonly string[]
  instrumentOptions: readonly string[]
  onStatusChange: (projectId: string, status: string) => void
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
}

export function ProjectCard({
  project,
  projectStatusOptions,
  onStatusChange,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isStatusPending, startStatusTransition] = useTransition()

  const handleStatusChange = (status: string) => {
    if (status === project.status) return

    startStatusTransition(async () => {
      onStatusChange(project.id, status)
    })
  }

  return (
    <div className="border rounded-lg hover:border-border/80 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-accent rounded-md transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <h4 className="font-medium truncate">{project.title}</h4>
              <Badge variant="outline">{project.status}</Badge>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground ml-7 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isStatusPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projectStatusOptions.map((statusOption) => (
                  <DropdownMenuItem
                    key={statusOption}
                    onClick={() => handleStatusChange(statusOption)}
                  >
                    {statusOption.charAt(0) + statusOption.slice(1).toLowerCase()}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-destructive"
                >
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{project.stages.length} stages</span>
                <span>{project.groups.length} groups</span>
                <span>{project.groups.reduce((acc, group) => acc + group.members.length, 0)} students</span>
              </div>
              <Link href={`/dashboard/teacher/projects/${project.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Detail Proyek
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}