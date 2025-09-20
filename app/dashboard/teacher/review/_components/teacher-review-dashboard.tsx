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
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Assessment Review</h1>
                <p className="text-muted-foreground mt-1">
                  Grade reflections, peer feedback, and observation notes to guide your students through the PjBL stages.
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No classes assigned</CardTitle>
              <CardDescription>
                You need to be assigned to a class to review student progress. Contact your school administrator.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  const classProjects = data.classProjects[selectedClass] ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Assessment Review</h1>
              <p className="text-muted-foreground mt-1">
                Grade reflections, peer feedback, and observation notes to guide your students through the PjBL stages.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/teacher">
                  <ChevronsDown className="h-4 w-4 mr-2 rotate-180" />
                  Back to Dashboard
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={selectedClass} onValueChange={setSelectedClass} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Select Class</h2>
            <p className="text-sm text-muted-foreground">Choose a class to review student submissions</p>
          </div>
        </div>
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
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <NotebookPen className="h-12 w-12 text-muted-foreground mb-4" />
                  <CardTitle className="text-lg mb-2">No projects yet</CardTitle>
                  <CardDescription>
                    Publish a project for this class to begin tracking student submissions.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              classProjects.map((project) => (
                <Card key={project.id} className="border-muted shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription>
                          Review student progress stage by stage. Update observation scores to unlock subsequent stages.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {project.stages.length} stages
                        </Badge>
                        <Badge variant="outline">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.stages.map((stage, index) => (
                        <div key={stage.id} className="border border-border rounded-lg overflow-hidden">
                          <div className="bg-card border-b">
                            <Accordion type="single" value={stage.id} className="w-full">
                              <AccordionItem value={stage.id} className="border-0">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-foreground font-semibold">
                                        {index + 1}
                                      </div>
                                      <div className="text-left">
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                          {stage.name}
                                        </h3>
                                        <StageInstrumentSummary instruments={stage.instruments} />
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="ml-4">
                                      {stage.students.length} student{stage.students.length !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 py-4">
                                  <StageStudentsTable
                                    stage={stage}
                                    projectId={project.id}
                                    teacher={teacher}
                                    router={router}
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
      </main>
    </div>
  )
}

function StageInstrumentSummary({ instruments }: { instruments: string[] }) {
  if (instruments.length === 0) {
    return <span className="text-sm text-muted-foreground">No instruments configured.</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5 text-sm text-muted-foreground">
      {instruments.map((instrument) => (
        <span key={instrument} className="px-2 py-1 bg-muted rounded-md text-xs capitalize">
          {instrument.replace(/_/g, " ")}
        </span>
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
    <div className="rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
      <header className="p-6 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="font-semibold text-sm">
                {(student.name ?? "UN").charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{student.name ?? "Unnamed learner"}</h4>
              <p className="text-sm text-muted-foreground">
                {student.groupName ? `Group: ${student.groupName}` : "Independent work"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={progressLabel.variant}>{progressLabel.label}</Badge>
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
                variant="default"
                size="sm"
                onClick={() => onOverrideStatus("COMPLETED")}
                disabled={isStatusTransition}
              >
                Mark complete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
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
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-8 text-center text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">No submissions yet for this stage.</span>
            </div>
          )}
        </div>
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
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
              {submission.instrumentType === "OBSERVATION" && <MessageSquareText className="h-5 w-5" />}
              {submission.instrumentType === "JOURNAL" && <NotebookPen className="h-5 w-5" />}
              {submission.instrumentType === "SELF_ASSESSMENT" && <CheckCircle2 className="h-5 w-5" />}
              {submission.instrumentType === "PEER_ASSESSMENT" && <MessageSquareText className="h-5 w-5" />}
              {submission.instrumentType === "DAILY_NOTE" && <NotebookPen className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base font-semibold capitalize">
                {submission.instrumentType.replace(/_/g, " ")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Student submission</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {formatDate(submission.submittedAt)}
          </Badge>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg border">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {extractSubmissionText(submission.content)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Provide Feedback</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Score (0-100)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="e.g. 85"
                          className="focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Feedback for learner</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Share your observations and next steps..."
                        className="resize-none focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
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
        </div>
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
