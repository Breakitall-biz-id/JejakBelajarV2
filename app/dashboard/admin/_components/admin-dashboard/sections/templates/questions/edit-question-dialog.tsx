"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const editQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum(["STATEMENT", "ESSAY_PROMPT"], {
    required_error: "Question type is required",
  }),
  scoringGuide: z.string().optional(),
})

type EditQuestionSchema = z.infer<typeof editQuestionSchema>

type TemplateQuestion = {
  id: string
  questionText: string
  questionType: string
  scoringGuide: string | null
  createdAt: string
}

type EditQuestionDialogProps = {
  question: TemplateQuestion
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditQuestionDialog({
  question,
  open,
  onOpenChange,
  onSuccess,
}: EditQuestionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditQuestionSchema>({
    resolver: zodResolver(editQuestionSchema),
    defaultValues: {
      questionText: "",
      questionType: "STATEMENT",
      scoringGuide: "",
    },
  })

  useEffect(() => {
    if (question) {
      form.reset({
        questionText: question.questionText,
        questionType: question.questionType as "STATEMENT" | "ESSAY_PROMPT",
        scoringGuide: question.scoringGuide || "",
      })
    }
  }, [question, form])

  const onSubmit = async (values: EditQuestionSchema) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/templates/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update question')
      }

      toast.success("Question updated successfully!")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update question")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the question text..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the main question or statement that will be presented to users.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STATEMENT">Statement</SelectItem>
                      <SelectItem value="ESSAY_PROMPT">Essay Prompt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    <span className="text-muted-foreground">
                      <strong>Statement:</strong> For rating scale questions (Always/Often/Sometimes/Never)
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                      <strong>Essay Prompt:</strong> For open-ended written responses
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scoringGuide"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scoring Guide (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Example: Always=4, Often=3, Sometimes=2, Never=1"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define how this question should be scored. This helps maintain consistency in assessment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Question"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}