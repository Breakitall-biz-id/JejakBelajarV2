import { NextResponse } from "next/server"

import { requireTeacherUser } from "@/lib/auth/session"

import { getTeacherReportData } from "@/app/dashboard/teacher/reports/queries"
import { getTeacherReviewData } from "@/app/dashboard/teacher/review/queries"

type CsvRow = Array<string | number | null | undefined>

export async function GET(request: Request) {
  const session = await requireTeacherUser()
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get("type") ?? "summary").toLowerCase()
  const classIdFilter = searchParams.get("classId") ?? undefined

  switch (type) {
    case "summary": {
      const data = await getTeacherReportData(session.user)
      const csv = buildSummaryCsv(data)
      return csvResponse(csv, "teacher-summary")
    }
    case "student": {
      const data = await getTeacherReviewData(session.user)
      const csv = buildStudentDetailCsv(data, classIdFilter)
      return csvResponse(csv, classIdFilter ? `class-${classIdFilter}-students` : "teacher-students")
    }
    default:
      return NextResponse.json({ error: "Unknown export type" }, { status: 400 })
  }
}

function buildSummaryCsv(data: Awaited<ReturnType<typeof getTeacherReportData>>): string {
  // Get all unique dimension names for headers
  const allDimensions = new Set<string>()
  data.classes.forEach(item => {
    item.dimensionScores.forEach(dim => {
      allDimensions.add(dim.dimensionName)
    })
  })

  const dimensionHeaders = Array.from(allDimensions).sort()

  const rows: CsvRow[] = [
    [
      "Class",
      "Students",
      "Projects",
      "Stages",
      "Completed assignments",
      "Completion rate (%)",
      "Overall Average",
      "Overall Qualitative",
      ...dimensionHeaders.map(dim => `${dim} Avg`),
      ...dimensionHeaders.map(dim => `${dim} Qualitative`),
      "Last submission",
    ],
  ]

  data.classes
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((item) => {
      const dimensionMap = new Map(item.dimensionScores.map(dim => [dim.dimensionName, dim]))

      const dimensionAverages = dimensionHeaders.map(dim => {
        const dimScore = dimensionMap.get(dim)
        return formatCsvNumber(dimScore?.averageScore ?? null)
      })

      const dimensionQualitative = dimensionHeaders.map(dim => {
        const dimScore = dimensionMap.get(dim)
        return dimScore?.qualitativeScore ?? ""
      })

      rows.push([
        item.name,
        item.totalStudents,
        item.totalProjects,
        item.totalStages,
        item.completedAssignments,
        item.completionRate,
        formatCsvNumber(item.overallAverageScore),
        item.overallQualitativeScore,
        ...dimensionAverages,
        ...dimensionQualitative,
        item.lastSubmissionAt ?? "",
      ])
    })

  return stringifyCsv(rows)
}

function buildStudentDetailCsv(
  data: Awaited<ReturnType<typeof getTeacherReviewData>>,
  classIdFilter?: string,
): string {
  const classNameLookup = new Map(data.classes.map((cls) => [cls.id, cls.name]))
  const rows: CsvRow[] = [
    [
      "Class",
      "Project",
      "Stage order",
      "Stage",
      "Student",
      "Group",
      "Stage status",
      "Instrument",
      "Score",
      "Feedback",
      "Submitted at",
    ],
  ]

  const classEntries = Object.entries(data.classProjects)

  classEntries.forEach(([classId, projects]) => {
    if (classIdFilter && classId !== classIdFilter) {
      return
    }

    const className = classNameLookup.get(classId) ?? "Unknown class"

    projects.forEach((project) => {
      project.stages.forEach((stage) => {
        stage.students.forEach((student) => {
          const statusLabel = student.progress.status
          const groupLabel = student.groupName ?? "—"

          const instruments = stage.instruments.length > 0 ? stage.instruments : ["(no instrument configured)"]

          instruments.forEach((instrumentType) => {
            const submission = student.submissions.find(
              (item) => item.instrumentType === instrumentType,
            )

            rows.push([
              className,
              project.title,
              stage.order,
              stage.name,
              student.name ?? "Unnamed student",
              groupLabel,
              statusLabel,
              instrumentType,
              submission?.score ?? "",
              submission?.feedback ?? "",
              submission?.submittedAt ?? "",
            ])
          })
        })
      })
    })
  })

  return stringifyCsv(rows)
}

function csvResponse(csv: string, basename: string) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0]
  const filename = `${basename}-${timestamp}.csv`

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  })
}

function stringifyCsv(rows: CsvRow[]): string {
  return rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n")
}

function escapeCsvValue(value: CsvRow[number]): string {
  if (value === undefined || value === null) {
    return ""
  }

  const stringValue = String(value)

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function formatCsvNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return ""
  }
  return value.toFixed(2)
}
