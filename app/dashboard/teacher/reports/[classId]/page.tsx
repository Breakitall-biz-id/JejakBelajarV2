"use client"

import { useState } from "react"
import * as React from "react"
import { ArrowLeft, Search, Download } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type StudentGradeData = {
  id: string
  name: string
  email?: string
  className: string
  groupName?: string
  projectGrades: Array<{
    projectId: string
    projectTitle: string
    grade: number | null
    submissions: number
    maxSubmissions: number
    completedAt?: string
  }>
  averageGrade: number
  totalSubmissions: number
  completionRate: number
}

type ClassDetailPageProps = {
  params: Promise<{
    classId: string
  }>
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { classId } = await params

  return <ClassDetailPageContent classId={classId} />
}

function ClassDetailPageContent({ classId }: { classId: string }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState<{
    className: string
    students: StudentGradeData[]
    projects: Array<{
      id: string
      title: string
      totalStages: number
    }>
  } | null>(null)

  React.useEffect(() => {
    async function loadClassData() {
      try {
        const response = await fetch(`/api/teacher/class-detail?classId=${classId}`)
        if (response.ok) {
          const data = await response.json()
          setClassData(data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadClassData()
  }, [classId])

  const filteredStudents = classData?.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  function GradeBadge({ grade }: { grade: number }) {
    if (grade >= 3.5) return (
      <Badge variant="default" className="text-xs">Excellent</Badge>
    )
    if (grade >= 3.0) return (
      <Badge variant="default" className="text-xs">Good</Badge>
    )
    if (grade >= 2.0) return (
      <Badge variant="secondary" className="text-xs">Satisfactory</Badge>
    )
    if (grade > 0) return (
      <Badge variant="destructive" className="text-xs">Needs Improvement</Badge>
    )
    return null
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">Class not found</div>
            <div className="text-muted-foreground mb-4">
              The requested class could not be found.
            </div>
            <Button onClick={() => router.push("/dashboard/teacher/reports")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/teacher/reports")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{classData.className}</CardTitle>
                <p className="text-muted-foreground">Student grades and progress overview</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Grades
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Group</TableHead>
                  {classData.projects.map((project) => (
                    <TableHead key={project.id} className="text-center">
                      <div className="text-xs font-medium">
                        {project.title.length > 12
                          ? project.title.substring(0, 12) + '...'
                          : project.title}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Average</TableHead>
                  <TableHead className="text-center">Completion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4 + classData.projects.length} className="text-center">
                      <div className="py-8 text-muted-foreground">
                        No students found matching your search.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          {student.email && (
                            <div className="text-sm text-muted-foreground">
                              {student.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.groupName ? (
                          <Badge variant="outline">{student.groupName}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No Group</span>
                        )}
                      </TableCell>
                      {student.projectGrades.map((projectGrade) => (
                        <TableCell key={projectGrade.projectId} className="text-center">
                          {projectGrade.grade !== null ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-medium text-sm">
                                {projectGrade.grade.toFixed(1)}
                              </span>
                              <GradeBadge grade={projectGrade.grade} />
                              <div className="text-xs text-muted-foreground">
                                {projectGrade.submissions}/{projectGrade.maxSubmissions}
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-sm">
                              <div>-</div>
                              <div className="text-xs">
                                {projectGrade.submissions}/{projectGrade.maxSubmissions}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">
                            {student.averageGrade.toFixed(1)}
                          </span>
                          <GradeBadge grade={student.averageGrade} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="font-medium text-sm">
                              {student.completionRate}%
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${student.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/teacher/reports/${classId}/student/${student.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}