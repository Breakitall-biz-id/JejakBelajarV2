"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle, Clock, Users, BookOpen, FileText, MessageSquare, Eye, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type ProjectStage = {
  id: string
  name: string
  description?: string
  status: "COMPLETED" | "IN_PROGRESS" | "LOCKED" | "UPCOMING"
  order: number
  instruments: string[]
  dueDate?: string
  progress: number
}

type Group = {
  id: string
  name: string
  members: number
  progress: number
}

type Project = {
  id: string
  title: string
  description?: string
  theme: string
  status: "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED"
  stages: ProjectStage[]
  groups: Group[]
  totalStudents: number
  createdAt: string
  templateName?: string
}

export default function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)

  // Mock data - in real app, this would come from API
  const project: Project = {
    id: projectId,
    title: "Kokurikuler Project: Environmental Awareness",
    description: "Students will explore environmental issues and create solutions for local community problems.",
    theme: "Environmental Sustainability",
    status: "IN_PROGRESS",
    templateName: "Standard Kokurikuler Template",
    stages: [
      {
        id: "1",
        name: "Planning & Research",
        description: "Identify environmental issues and research potential solutions",
        status: "COMPLETED",
        order: 1,
        instruments: ["Journal", "Self-Assessment"],
        dueDate: "2024-03-15",
        progress: 100
      },
      {
        id: "2",
        name: "Implementation",
        description: "Execute the planned environmental solution",
        status: "IN_PROGRESS",
        order: 2,
        instruments: ["Journal", "Peer-Assessment"],
        dueDate: "2024-04-15",
        progress: 65
      },
      {
        id: "3",
        name: "Evaluation & Reflection",
        description: "Assess the impact and reflect on learning outcomes",
        status: "LOCKED",
        order: 3,
        instruments: ["Journal", "Self-Assessment", "Observation"],
        dueDate: "2024-05-15",
        progress: 0
      },
      {
        id: "4",
        name: "Presentation",
        description: "Present findings and solutions to the community",
        status: "LOCKED",
        order: 4,
        instruments: ["Peer-Assessment", "Observation"],
        dueDate: "2024-05-30",
        progress: 0
      }
    ],
    groups: [
      { id: "1", name: "Green Warriors", members: 4, progress: 80 },
      { id: "2", name: "Eco Champions", members: 3, progress: 60 },
      { id: "3", name: "Nature Protectors", members: 4, progress: 70 }
    ],
    totalStudents: 11,
    createdAt: "2024-02-01"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200"
      case "LOCKED": return "bg-gray-100 text-gray-800 border-gray-200"
      case "UPCOMING": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "IN_PROGRESS": return <Clock className="h-4 w-4 text-blue-600" />
      case "LOCKED": return <Lock className="h-4 w-4 text-gray-600" />
      case "UPCOMING": return <Calendar className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getInstrumentIcon = (instrument: string) => {
    switch (instrument) {
      case "Journal": return <FileText className="h-4 w-4" />
      case "Self-Assessment": return <MessageSquare className="h-4 w-4" />
      case "Peer-Assessment": return <Users className="h-4 w-4" />
      case "Observation": return <Eye className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const overallProgress = Math.round(
    project.stages.reduce((sum, stage) => sum + stage.progress, 0) / project.stages.length
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teacher">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Template</p>
                <p className="font-medium">{project.templateName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="font-medium">{project.totalStudents} students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-green-600"></div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium">{overallProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-green-600"></div>
            Overall Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{overallProgress}% Selesai</span>
              <span>{project.stages.filter(s => s.status === "COMPLETED").length} dari {project.stages.length} tahapan selesai</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {project.stages.map((stage, index) => (
              <div key={stage.id} className="relative">
                {/* Timeline connector */}
                {index < project.stages.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                )}

                <div className="flex gap-4">
                  {/* Stage status indicator */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 bg-background flex items-center justify-center">
                    {getStatusIcon(stage.status)}
                  </div>

                  {/* Stage content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{stage.name}</h3>
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(stage.status)}>
                          {stage.status.replace("_", " ")}
                        </Badge>
                        {stage.dueDate && (
                          <span className="text-sm text-muted-foreground">
                            Due: {new Date(stage.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stage Progress</span>
                        <span>{stage.progress}%</span>
                      </div>
                      <Progress value={stage.progress} className="h-2" />
                    </div>

                    {/* Instruments */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Instruments:</span>
                      {stage.instruments.map((instrument) => (
                        <Badge key={instrument} variant="outline" className="text-xs">
                          <div className="flex items-center gap-1">
                            {getInstrumentIcon(instrument)}
                            {instrument}
                          </div>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Student Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.groups.map((group) => (
              <Card key={group.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{group.name}</h4>
                      <Badge variant="outline">{group.members} members</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Group Progress</span>
                        <span>{group.progress}%</span>
                      </div>
                      <Progress value={group.progress} className="h-2" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}