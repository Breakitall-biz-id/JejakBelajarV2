"use client"

import { useState } from "react"
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

const createQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum(["STATEMENT", "ESSAY_PROMPT"], {
    required_error: "Question type is required",
  }),
  scoringGuide: z.string().optional(),
})

type CreateQuestionSchema = z.infer<typeof createQuestionSchema>

type CreateQuestionDialogProps = {
  configId: string
  instrumentType: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateQuestionDialog({
  configId,
  instrumentType,
  open,
  onOpenChange,
  onSuccess,
}: CreateQuestionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateQuestionSchema>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      questionText: "",
      questionType: "STATEMENT",
      scoringGuide: "",
    },
  })

  const onSubmit = async (values: CreateQuestionSchema) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/templates/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          configId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create question')
      }

      toast.success("Question created successfully!")
      onSuccess()
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create question")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInstrumentTypeLabel = (type: string) => {
    switch (type) {
      case 'JOURNAL':
        return 'Journal'
      case 'SELF_ASSESSMENT':
        return 'Self Assessment'
      case 'PEER_ASSESSMENT':
        return 'Peer Assessment'
      case 'OBSERVATION':
        return 'Observation'
      default:
        return type
    }
  }

  const getScoringGuidePlaceholder = (type: string) => {
    switch (type) {
      case 'JOURNAL':
      case 'SELF_ASSESSMENT':
      case 'PEER_ASSESSMENT':
        return "Example: Always=4, Often=3, Sometimes=2, Never=1"
      case 'OBSERVATION':
        return "Example: Excellent=4, Good=3, Fair=2, Poor=1"
      default:
        return "Enter scoring criteria..."
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Add a new question for {getInstrumentTypeLabel(instrumentType)} assessment.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      placeholder={getScoringGuidePlaceholder(instrumentType)}
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
                {isSubmitting ? "Creating..." : "Create Question"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}