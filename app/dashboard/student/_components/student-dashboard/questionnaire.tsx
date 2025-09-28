"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, Send, Users, Eye } from "lucide-react"
import { toast } from "sonner"

import type { CurrentUser } from "@/lib/auth/session"
import { submitQuestionnaire } from "../../actions"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

type QuestionnaireQuestion = {
  id: string
  questionText: string
  questionType: string
  scoringGuide?: string
}

type QuestionnaireProps = {
  questions: QuestionnaireQuestion[]
  instrumentType: "SELF_ASSESSMENT" | "PEER_ASSESSMENT" | "OBSERVATION"
  stageId: string
  projectId: string
  targetStudent?: {
    id: string
    name: string | null
  }
  existingSubmission?: {
    content: Record<string, number>
    submittedAt: string
  }
  router: AppRouterInstance
}

const questionnaireSchema = z.object({
  answers: z.record(z.string(), z.number().min(1).max(4)),
})

type QuestionnaireForm = z.infer<typeof questionnaireSchema>

const scoringOptions = [
  { value: 4, label: "Always", description: "Sangat sering" },
  { value: 3, label: "Often", description: "Sering" },
  { value: 2, label: "Sometimes", description: "Kadang-kadang" },
  { value: 1, label: "Never", description: "Tidak pernah" },
]

export function Questionnaire({
  questions,
  instrumentType,
  stageId,
  projectId,
  targetStudent,
  existingSubmission,
  router,
}: QuestionnaireProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<QuestionnaireForm>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      answers: existingSubmission?.content || {},
    },
  })

  const onSubmit = (values: QuestionnaireForm) => {
    startTransition(async () => {
      const result = await submitQuestionnaire({
        projectId,
        stageId,
        instrumentType,
        answers: values.answers,
        targetStudentId: targetStudent?.id,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Questionnaire submitted successfully!")
      router.refresh()
    })
  }

  const getInstrumentTitle = () => {
    switch (instrumentType) {
      case "SELF_ASSESSMENT":
        return "Self-Assessment Questionnaire"
      case "PEER_ASSESSMENT":
        return `Peer Assessment for ${targetStudent?.name || "Peer"}`
      case "OBSERVATION":
        return "Observation Sheet Questionnaire"
      default:
        return "Questionnaire"
    }
  }

  const getInstrumentIcon = () => {
    switch (instrumentType) {
      case "SELF_ASSESSMENT":
        return <ClipboardList className="h-5 w-5" />
      case "PEER_ASSESSMENT":
        return <Users className="h-5 w-5" />
      case "OBSERVATION":
        return <Eye className="h-5 w-5" />
      default:
        return <ClipboardList className="h-5 w-5" />
    }
  }

  const isCompleted = !!existingSubmission

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {getInstrumentIcon()}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              {getInstrumentTitle()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <CardDescription className="text-sm">
                {questions.length} questions • Please rate each statement
              </CardDescription>
              {isCompleted && (
                <Badge variant="secondary" className="text-xs">
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="text-sm font-medium mb-2">Scoring Guide:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {scoringOptions.map((option) => (
              <div key={option.value} className="text-center">
                <span className="font-medium">{option.label}</span>
                <div className="text-muted-foreground">{option.description}</div>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/5 text-primary text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-sm font-medium leading-relaxed">
                        {question.questionText}
                      </Label>
                    </div>

                    <FormField
                      control={form.control}
                      name={`answers.${question.id}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              className="flex flex-col space-y-2"
                              disabled={isCompleted || isPending}
                            >
                              {scoringOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value={option.value.toString()}
                                    id={`${question.id}-${option.value}`}
                                  />
                                  <Label
                                    htmlFor={`${question.id}-${option.value}`}
                                    className="flex items-center justify-between w-full cursor-pointer rounded-md border border-border p-3 hover:bg-muted/50 transition-colors"
                                  >
                                    <span className="font-medium text-sm">{option.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {index < questions.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            <div className="flex justify-end pt-4">
              {!isCompleted && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4 animate-pulse" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Questionnaire
                    </span>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}