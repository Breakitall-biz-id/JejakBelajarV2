"use client"

import { useState, use } from "react"
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

type StudentDetailData = {
  id: string
  name: string
  email?: string
  className: string
  groupName?: string
  projects: Array<{
    id: string
    title: string
    grade: number | null
    submissions: Array<{
      id: string
      instrumentType: string
      score: number | null
      feedback: string | null
      submittedAt: string
    }>
    completionRate: number
    lastSubmissionAt?: string
  }>
  averageGrade: number
  totalSubmissions: number
  overallCompletionRate: number
}

type StudentDetailPageProps = {
  params: Promise<{
    classId: string
    studentId: string
  }>
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { classId, studentId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState<StudentDetailData | null>(null)

  React.useEffect(() => {
    async function loadStudentData() {
      try {
        const response = await fetch(`/api/teacher/student-detail?classId=${classId}&studentId=${studentId}`)
        if (response.ok) {
          const data = await response.json()
          setStudentData(data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [classId, studentId])

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

  if (!studentData) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">Student not found</div>
            <div className="text-muted-foreground mb-4">
              The requested student could not be found.
            </div>
            <Button onClick={() => router.push(`/dashboard/teacher/reports/${classId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Class
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
          onClick={() => router.push(`/dashboard/teacher/reports/${classId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{studentData.name}</CardTitle>
                <p className="text-muted-foreground">
                  {studentData.className} {studentData.groupName && `• ${studentData.groupName}`}
                </p>
                {studentData.email && (
                  <p className="text-sm text-muted-foreground">{studentData.email}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Average Grade</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{studentData.averageGrade.toFixed(1)}</span>
                    <GradeBadge grade={studentData.averageGrade} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Completion</div>
                  <div className="text-2xl font-bold">{studentData.overallCompletionRate}%</div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {studentData.projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{project.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Grade</span>
                  {project.grade !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{project.grade.toFixed(1)}</span>
                      <GradeBadge grade={project.grade} />
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No grade</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Submissions</span>
                  <span className="font-medium">{project.submissions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{project.completionRate}%</span>
                  </div>
                </div>
                {project.lastSubmissionAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Activity</span>
                    <span className="text-sm">
                      {new Date(project.lastSubmissionAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Assessment Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentData.projects.flatMap(project =>
                  project.submissions.map(submission => (
                    <TableRow key={`${project.id}-${submission.id}`}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{submission.instrumentType}</Badge>
                      </TableCell>
                      <TableCell>
                        {submission.score !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{submission.score.toFixed(1)}</span>
                            <GradeBadge grade={submission.score} />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not graded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.feedback ? (
                          <div className="text-sm max-w-xs truncate">
                            {submission.feedback}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No feedback</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {studentData.projects.every(p => p.submissions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="py-8 text-muted-foreground">
                        No submissions found for this student.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}