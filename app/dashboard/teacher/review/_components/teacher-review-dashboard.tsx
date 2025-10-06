"use client"

import type { TeacherReviewData } from "../queries"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

type TeacherProject = {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  status: string;
  class: {
    id: string;
    name: string;
    academicYear: string;
    semester: string;
  };
  teacher: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
  group: {
    id: string;
    name: string;
    members: Array<{
      studentId: string;
      name: string;
      email: string;
    }>;
  } | null;
  stages: Array<{
    id: string;
    name: string;
    description: string | null;
    order: number;
    unlocksAt: string | null;
    dueAt: string | null;
    status: "LOCKED" | "IN_PROGRESS" | "COMPLETED";
    requiredInstruments: Array<{
      id: string;
      instrumentType: string;
      isRequired: boolean;
      description?: string | null;
    }>;
    submissions: Array<{
      id: string;
      instrumentType: string;
      content: unknown;
      submittedAt: string;
      score?: number | null;
      feedback?: string | null;
    }>;
    submissionsByInstrument: Record<string, unknown[]>;
    students: Array<{
      id: string;
      name: string;
      groupName?: string | null;
      groupId?: string | null;
      progress: {
        status: string;
        unlockedAt: string | null;
        completedAt: string | null;
      };
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
  currentStudentId?: string;
};


function ProjectProgressBar({ project }: { project: TeacherProject }) {
  const groupedStages = React.useMemo(() => {
    const map = new Map<string, typeof project.stages[number]>()
    for (const stage of project.stages) {
      if (!map.has(stage.name)) {
        map.set(stage.name, stage)
      } else {
        const existing = map.get(stage.name)!
        if (stage.order < existing.order) {
          map.set(stage.name, stage)
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order)
  }, [project])

  const totalStages = groupedStages.length
  const completedStages = groupedStages.filter(s => s.status === "COMPLETED").length
  const percent = totalStages === 0 ? 0 : Math.round((completedStages / totalStages) * 100)

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{percent}% selesai</span>
        <span>{completedStages}/{totalStages} Tahapan</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

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
            <span className="text-muted-foreground">{project.stages.length} tahapan</span>
            <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
              {progressPercentage}% selesai
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
  const selectedClassInfo = data.classes.find(c => c.id === selectedClass)

  const teacherProjects: TeacherProject[] = classProjects.map(project => ({
    id: project.id,
    title: project.title,
    theme: project.title,
    description: null,
    status: "IN_PROGRESS",
    class: {
      id: selectedClass,
      name: selectedClassInfo?.name || "",
      academicYear: "",
      semester: ""
    },
    teacher: {
      id: null,
      name: null,
      email: null
    },
    stages: project.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      order: stage.order,
      unlocksAt: stage.unlocksAt?.toISOString() || null,
      dueAt: stage.dueAt?.toISOString() || null,
      status: "IN_PROGRESS" as const,
      requiredInstruments: stage.instruments.map(instrument => ({
        id: instrument,
        instrumentType: instrument,
        isRequired: true,
        description: null
      })),
      submissions: stage.students.flatMap(student => student.submissions),
      submissionsByInstrument: stage.students.reduce((acc, student) => {
        student.submissions.forEach(submission => {
          if (!acc[submission.instrumentType]) {
            acc[submission.instrumentType] = []
          }
          acc[submission.instrumentType].push(submission)
        })
        return acc
      }, {} as Record<string, unknown[]>),
      students: stage.students.map(student => ({
        id: student.id,
        name: student.name || "",
        groupName: student.groupName,
        groupId: student.groupId,
        progress: {
          status: student.progress.status,
          unlockedAt: student.progress.unlockedAt,
          completedAt: student.progress.completedAt
        },
        submissions: student.submissions
      }))
    })),
    group: {
      id: "default-group",
      name: "Default Group",
      members: []
    },
    currentStudentId: undefined
  }))

  return (
    <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Review Proyek - {selectedClassInfo?.name || ''}</h1>
              <div className="text-base text-muted-foreground font-medium">Pantau dan nilai kemajuan siswa</div>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedClass === classInfo.id
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
            <div className="text-lg font-semibold mb-2">Belum ada proyek</div>
            <div className="text-muted-foreground">
              Belum ada proyek yang ditugaskan untuk kelas ini.
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