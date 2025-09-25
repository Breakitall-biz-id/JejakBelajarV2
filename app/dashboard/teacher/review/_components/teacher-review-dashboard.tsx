"use client"

import type { TeacherReviewData } from "../queries"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { ProjectProgressBar } from "../../../student/_components/student-dashboard/project-progress-bar"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

type TeacherProject = {
  id: string;
  title: string;
  theme: string;
  description?: string;
  stages: Array<{
    id: string;
    name: string;
    description: string | null;
    order: number;
    unlocksAt: string | null;
    dueAt: string | null;
    status: string;
    requiredInstruments: Array<{
      id: string;
      instrumentType: string;
      isRequired: boolean;
      description?: string | null;
    }>;
    submissionsByInstrument: Record<string, unknown[]>;
    students: Array<{
      id: string;
      name: string;
      groupName?: string;
      groupId?: string;
      progress: { status: string };
      submissions: Array<{
        id: string;
        instrumentType: string;
        content: unknown;
        submittedAt: string;
        score?: number | null;
        feedback?: string | null;
      }>;
    }>;
  }>;
  group?: {
    members: Array<{
      studentId: string;
      name: string;
      email: string;
    }>;
  };
  currentStudentId?: string;
};


function ProjectCard({ project, onNavigate }: { project: TeacherProject; onNavigate: () => void }) {
  const completedStages = project.stages.filter(stage =>
    stage.students.some(student => student.progress.status === "COMPLETED")
  ).length

  const progressPercentage = project.stages.length > 0
    ? Math.round((completedStages / project.stages.length) * 100)
    : 0

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md border-muted hover:border-primary/50"
      onClick={onNavigate}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="text-sm text-muted-foreground">{project.theme}</p>
          </div>

          <ProjectProgressBar project={project} />

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{project.stages.length} stages</span>
            <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
              {progressPercentage}% complete
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TeacherReviewDashboard({ data }: { data: TeacherReviewData }) {
  const router = useRouter()
  const defaultClassId = data.classes && data.classes.length > 0 ? data.classes[0]?.id ?? "" : ""
  const [selectedClass, setSelectedClass] = React.useState(defaultClassId)

  const classProjects = (data.classProjects && selectedClass) ? data.classProjects[selectedClass] ?? [] : []

  // Transform data to match student dashboard structure
  const teacherProjects: TeacherProject[] = classProjects.map(project => ({
    id: project.id,
    title: project.title,
    theme: project.title,
    description: project.description,
    stages: project.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      order: 0,
      unlocksAt: stage.unlocksAt?.toISOString() || null,
      dueAt: stage.dueAt?.toISOString() || null,
      status: "IN_PROGRESS",
      requiredInstruments: [
        {
          id: "journal",
          instrumentType: "JOURNAL",
          isRequired: true,
          description: "Refleksi harian selama proses pengerjaan proyek"
        },
        {
          id: "self",
          instrumentType: "SELF_ASSESSMENT",
          isRequired: true,
          description: "Penilaian diri terhadap proses dan hasil belajar"
        },
        {
          id: "peer",
          instrumentType: "PEER_ASSESSMENT",
          isRequired: true,
          description: "Penilaian antar anggota kelompok"
        },
        {
          id: "observation",
          instrumentType: "OBSERVATION",
          isRequired: true,
          description: "Penilaian observasi oleh guru"
        },
        {
          id: "daily",
          instrumentType: "DAILY_NOTE",
          isRequired: true,
          description: "Catatan kemajuan harian"
        }
      ],
      submissionsByInstrument: stage.students.reduce((acc, student) => {
        student.submissions.forEach(submission => {
          if (!acc[submission.instrumentType]) {
            acc[submission.instrumentType] = []
          }
          acc[submission.instrumentType].push(submission)
        })
        return acc
      }, {} as Record<string, unknown[]>),
      students: stage.students
    })),
    group: {
      members: []
    }
  }))

  // Get selected class for display
  const selectedClassInfo = data.classes.find(c => c.id === selectedClass)

  return (
    <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Review Project - {selectedClassInfo?.name || ''}</h1>
              <div className="text-base text-muted-foreground font-medium">Monitor and assess student progress</div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
            </div>
          </div>

          {/* Class Selection */}
          <div className="flex flex-wrap gap-2">
            {data.classes.map((classInfo) => (
              <button
                key={classInfo.id}
                onClick={() => setSelectedClass(classInfo.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedClass === classInfo.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {classInfo.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      {teacherProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">No projects yet</div>
            <div className="text-muted-foreground">
              No projects assigned to this class.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onNavigate={() => router.push(`/dashboard/teacher/review/${selectedClass}/${project.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}