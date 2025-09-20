import { useTransition, useMemo, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen, ClipboardList, Edit, PenLine, Send, Users } from "lucide-react"
import { toast } from "sonner"
import { Questionnaire } from "./questionnaire"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { CurrentUser } from "@/lib/auth/session"
import type { StudentDashboardData } from "../../queries"

import { submitStageInstrument, studentInstrumentSchema } from "../../actions"
import { getTemplateQuestions } from "../../queries"
import {
  extractSubmissionText,
  formatInstrument,
  instrumentDescription,
} from "./helpers"

type InstrumentSubmissionCardProps = {
  stage: StudentDashboardData["projects"][number]["stages"][number]
  instrumentType: string
  existingSubmission?: StudentDashboardData["projects"][number]["stages"][number]["submissions"][number]
  student: CurrentUser
  projectId: string
  peers: Array<{
    studentId: string
    name: string | null
    email: string
  }>
  router: AppRouterInstance
}

export function InstrumentSubmissionCard({
  stage,
  instrumentType,
  existingSubmission,
  student,
  projectId,
  peers,
  router,
}: InstrumentSubmissionCardProps) {
  const [isPending, startTransition] = useTransition()
  const [templateQuestions, setTemplateQuestions] = useState<Array<{
    id: string
    questionText: string
    questionType: string
    scoringGuide?: string
  }>>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const hasPeers = peers.length > 0

  const isQuestionnaireType = ["SELF_ASSESSMENT", "PEER_ASSESSMENT", "OBSERVATION"].includes(instrumentType)

  useEffect(() => {
    if (isQuestionnaireType) {
      setIsLoadingQuestions(true)
      getTemplateQuestions(stage.id)
        .then(setTemplateQuestions)
        .catch(console.error)
        .finally(() => setIsLoadingQuestions(false))
    }
  }, [stage.id, isQuestionnaireType])

  const formSchema = useMemo(() => {
    if (instrumentType === "PEER_ASSESSMENT") {
      if (!hasPeers) {
        return z.object({
          response: z.string().trim().min(1, "Response is required."),
          targetStudentId: z.string().optional(),
        })
      }

      return z.object({
        response: z.string().trim().min(1, "Response is required."),
        targetStudentId: z.string().uuid({ message: "Select a peer." }),
      })
    }

    return z.object({
      response: z.string().trim().min(1, "Response is required."),
    })
  }, [instrumentType, hasPeers])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      response: extractSubmissionText(existingSubmission?.content) ?? "",
      ...(instrumentType === "PEER_ASSESSMENT"
        ? {
            targetStudentId:
              existingSubmission?.targetStudentId ?? (hasPeers ? peers[0]?.studentId ?? "" : ""),
          }
        : {}),
    } as z.infer<typeof formSchema>,
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (instrumentType === "PEER_ASSESSMENT" && !hasPeers) {
      toast.error("No peers available in your group yet.")
      return
    }

    if (instrumentType === "PEER_ASSESSMENT" && "targetStudentId" in values) {
      if (!values.targetStudentId || values.targetStudentId.length === 0) {
        form.setError("targetStudentId" as keyof typeof values, { message: "Select a peer." })
        return
      }
    }

    startTransition(async () => {
      const result = await submitStageInstrument({
        projectId,
        stageId: stage.id,
        instrumentType: instrumentType as z.infer<typeof studentInstrumentSchema>,
        content: { text: values.response },
        targetStudentId: "targetStudentId" in values ? values.targetStudentId : undefined,
      })

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof typeof values, {
              message: messages?.[0] ?? result.error,
            })
          }
        }

        toast.error(result.error)
        return
      }

      toast.success("Submission saved.")
      router.refresh()
    })
  }

  // Show loading state for questionnaire types
  if (isQuestionnaireType && isLoadingQuestions) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading questionnaire...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // For questionnaire-based instruments, use the modern questionnaire interface
  if (isQuestionnaireType && templateQuestions.length > 0) {
    const targetStudent = instrumentType === "PEER_ASSESSMENT" && peers.length > 0
      ? peers[0]
      : undefined

    return (
      <Questionnaire
        questions={templateQuestions}
        instrumentType={instrumentType as "SELF_ASSESSMENT" | "PEER_ASSESSMENT" | "OBSERVATION"}
        stageId={stage.id}
        projectId={projectId}
        targetStudent={targetStudent}
        existingSubmission={existingSubmission ? {
          content: existingSubmission.content as Record<string, number>,
          submittedAt: existingSubmission.submittedAt,
        } : undefined}
            router={router}
      />
    )
  }

  // For traditional instruments (JOURNAL, DAILY_NOTE), use the original interface
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          {getInstrumentIcon(instrumentType)}
        </span>
        <div>
          <CardTitle className="text-base font-semibold">
            {formatInstrument(instrumentType)}
          </CardTitle>
          <CardDescription>{instrumentDescription(instrumentType)}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="response"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your response</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={instrumentType === "DAILY_NOTE" ? 3 : 5}
                      placeholder="Share your reflection..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {instrumentType === "PEER_ASSESSMENT" && (
              <FormField
                control={form.control}
                name="targetStudentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select peer</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger disabled={!hasPeers}>
                          <SelectValue placeholder="Choose a peer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {peers.map((peer) => (
                          <SelectItem key={peer.studentId} value={peer.studentId}>
                            {peer.name ?? peer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Your feedback remains visible to the teacher.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending || (instrumentType === "PEER_ASSESSMENT" && !hasPeers)}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4 animate-pulse" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" /> Submit
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

function getInstrumentIcon(instrument: string) {
  switch (instrument) {
    case "JOURNAL":
      return <PenLine className="h-4 w-4" />
    case "SELF_ASSESSMENT":
      return <ClipboardList className="h-4 w-4" />
    case "PEER_ASSESSMENT":
      return <Users className="h-4 w-4" />
    case "DAILY_NOTE":
      return <BookOpen className="h-4 w-4" />
    default:
      return <Edit className="h-4 w-4" />
  }
}
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
