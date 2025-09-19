"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  CheckCircle2,
  ChevronsDown,
  ClipboardCheck,
  Loader2,
  MessageSquareText,
  NotebookPen,
} from "lucide-react"
import { toast } from "sonner"

import type { CurrentUser } from "@/lib/auth/session"
import type { TeacherReviewData } from "../queries"
import { gradeSubmission, overrideStageStatus } from "../actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type TeacherReviewDashboardProps = {
  teacher: CurrentUser
  data: TeacherReviewData
}

export function TeacherReviewDashboard({ teacher, data }: TeacherReviewDashboardProps) {
  const router = useRouter()
  const defaultClassId = data.classes[0]?.id ?? ""
  const [selectedClass, setSelectedClass] = useState(defaultClassId)

  if (data.classes.length === 0) {
    return (
      <div className="px-4 pb-12 pt-6 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>No classes assigned</CardTitle>
            <CardDescription>
              You need to be assigned to a class to review student progress. Contact your school administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const classProjects = data.classProjects[selectedClass] ?? []

  return (
    <div className="space-y-8 px-4 pb-12 pt-6 lg:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assessment Review</h1>
        <p className="text-muted-foreground">
          Grade reflections, peer feedback, and observation notes to guide your students through the PjBL stages.
        </p>
      </header>

      <Tabs value={selectedClass} onValueChange={setSelectedClass} className="space-y-6">
        <TabsList className="w-full overflow-x-auto">
          {data.classes.map((classInfo) => (
            <TabsTrigger key={classInfo.id} value={classInfo.id} className="px-6">
              {classInfo.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.classes.map((classInfo) => (
          <TabsContent key={classInfo.id} value={classInfo.id} className="space-y-6">
            {classProjects.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No projects yet</CardTitle>
                  <CardDescription>
                    Publish a project for this class to begin tracking student submissions.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              classProjects.map((project) => (
                <Card key={project.id} className="border-muted">
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>
                      Review student progress stage by stage. Update observation scores to unlock subsequent stages.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="space-y-4">
                      {project.stages.map((stage) => (
                        <AccordionItem key={stage.id} value={stage.id} className="rounded-lg border">
                          <AccordionTrigger className="px-4 py-3">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="font-semibold">Stage {stage.order}: {stage.name}</span>
                              <StageInstrumentSummary instruments={stage.instruments} />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 bg-muted/40 px-4 py-4">
                            <StageStudentsTable
                              stage={stage}
                              projectId={project.id}
                              teacher={teacher}
                              router={router}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function StageInstrumentSummary({ instruments }: { instruments: string[] }) {
  if (instruments.length === 0) {
    return <span className="text-sm text-muted-foreground">No instruments configured.</span>
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      {instruments.map((instrument) => (
        <Badge key={instrument} variant="outline" className="capitalize">
          {instrument.replace(/_/g, " ")}
        </Badge>
      ))}
    </div>
  )
}

type StageStudentsTableProps = {
  stage: TeacherReviewData["classProjects"][string][number]["stages"][number]
  projectId: string
  teacher: CurrentUser
  router: ReturnType<typeof useRouter>
}

function StageStudentsTable({ stage, projectId, teacher, router }: StageStudentsTableProps) {
  if (stage.students.length === 0) {
    return <p className="text-sm text-muted-foreground">No students enrolled in this class.</p>
  }

  const studentRows = useMemo(
    () => [...stage.students].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [stage.students],
  )

  return (
    <div className="space-y-4">
      {studentRows.map((student) => (
        <StudentReviewPanel
          key={student.id}
          stage={stage}
          student={student}
          projectId={projectId}
          router={router}
        />
      ))}
    </div>
  )
}

type StudentReviewPanelProps = {
  stage: StageStudentsTableProps["stage"]
  student: StageStudentsTableProps["stage"]["students"][number]
  projectId: string
  router: ReturnType<typeof useRouter>
}

function StudentReviewPanel({ stage, student, projectId, router }: StudentReviewPanelProps) {
  const [isStatusTransition, startStatusTransition] = useTransition()
  const progressLabel = getProgressBadge(student.progress.status)
  const currentStudent = useMemo(
    () => stage.students.find((row) => row.id === student.id),
    [stage.students, student.id],
  )

  const onOverrideStatus = (status: z.infer<typeof overrideStatusSchema>["status"]) => {
    startStatusTransition(async () => {
      const result = await overrideStageStatus({
        projectId,
        stageId: stage.id,
        studentId: student.id,
        status,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Stage status updated.")
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg border bg-background p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{student.name ?? "Unnamed learner"}</span>
            <Badge variant={progressLabel.variant}>{progressLabel.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {student.groupName ? `Group: ${student.groupName}` : "Independent"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOverrideStatus("IN_PROGRESS")}
            disabled={isStatusTransition}
          >
            Reactivate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOverrideStatus("COMPLETED")}
            disabled={isStatusTransition}
          >
            Mark complete
          </Button>
        </div>
      </header>

      <Separator className="my-3" />

      <div className="space-y-4">
        {currentStudent?.submissions.map((submission) => (
          <SubmissionFeedbackCard
            key={submission.id}
            submission={submission}
            stage={stage}
            studentId={student.id}
            router={router}
          />
        ))}

        {(currentStudent?.submissions.length ?? 0) === 0 && (
          <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            No submissions yet for this stage.
          </div>
        )}
      </div>
    </div>
  )
}

const overrideStatusSchema = z.object({
  status: z.enum(["LOCKED", "IN_PROGRESS", "COMPLETED"]),
})

type SubmissionFeedbackCardProps = {
  submission: StageStudentsTableProps["stage"]["students"][number]["submissions"][number]
  stage: StageStudentsTableProps["stage"]
  studentId: string
  router: ReturnType<typeof useRouter>
}

function SubmissionFeedbackCard({ submission, stage, studentId, router }: SubmissionFeedbackCardProps) {
  const [isSubmitting, startSubmitting] = useTransition()
  const formSchema = useMemo(
    () =>
      z.object({
        score: z
          .string()
          .optional()
          .transform((value) => {
            if (!value) return null
            const parsed = Number(value)
            if (Number.isNaN(parsed)) {
              return null
            }
            return parsed
          })
          .refine((value) => value === null || (value >= 0 && value <= 100), {
            message: "Score must be between 0 and 100.",
          }),
        feedback: z.string().trim().min(1, "Feedback is required."),
      }),
    [],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: submission.score !== null && submission.score !== undefined ? String(submission.score) : "",
      feedback: submission.feedback ?? "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startSubmitting(async () => {
      const result = await gradeSubmission({
        submissionId: submission.id,
        score: values.score,
        feedback: values.feedback,
      })

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            form.setError(key as keyof typeof values, {
              message: messages?.[0] ?? result.error,
            })
          }
        }

        toast.error(result.error)
        return
      }

      toast.success("Feedback saved.")
      router.refresh()
    })
  }

  return (
    <Card className="border-muted">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold capitalize">
            {submission.instrumentType.replace(/_/g, " ")}
          </CardTitle>
          <Badge variant="outline">Submitted {formatDate(submission.submittedAt)}</Badge>
        </div>
        <CardDescription className="whitespace-pre-wrap">
          {extractSubmissionText(submission.content)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score (0-100)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={100} placeholder="e.g. 85" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Feedback for learner</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Share your observations and next steps" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Save feedback
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function getProgressBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return { label: "Completed", variant: "default" as const }
    case "IN_PROGRESS":
      return { label: "In Progress", variant: "secondary" as const }
    default:
      return { label: "Locked", variant: "outline" as const }
  }
}

function formatDate(value: string | null) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    )
  } catch (error) {
    console.warn("Unable to format date", value, error)
    return value
  }
}

function extractSubmissionText(content: unknown) {
  if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
    return content.text
  }
  if (typeof content === "string") {
    return content
  }
  return "—"
}
