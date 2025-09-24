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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

const getQuestionTypeEnum = (instrumentType: string) => {
  switch (instrumentType) {
    case 'SELF_ASSESSMENT':
      return z.enum(["STATEMENT"], {
        message: "Question type is required",
      })
    default:
      return z.enum(["STATEMENT", "ESSAY_PROMPT"], {
        message: "Question type is required",
      })
  }
}

const editQuestionSchema = (instrumentType: string) => z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: getQuestionTypeEnum(instrumentType),
  scoringGuide: z.string().optional(),
})

type EditQuestionSchema = z.infer<ReturnType<typeof editQuestionSchema>>

type TemplateQuestion = {
  id: string
  questionText: string
  questionType: string
  scoringGuide: string | null
  createdAt: string
}

type EditQuestionDialogProps = {
  question: TemplateQuestion
  instrumentType: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditQuestionDialog({
  question,
  instrumentType,
  open,
  onOpenChange,
  onSuccess,
}: EditQuestionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditQuestionSchema>({
    resolver: zodResolver(editQuestionSchema(instrumentType)),
    defaultValues: {
      questionText: "",
      questionType: "STATEMENT",
      scoringGuide: "",
    },
  })

  const getAvailableQuestionTypes = (type: string) => {
    switch (type) {
      case 'SELF_ASSESSMENT':
        return [{ value: "STATEMENT", label: "Statement (Skala)" }]
      case 'JOURNAL':
      case 'PEER_ASSESSMENT':
      case 'OBSERVATION':
      default:
        return [
          { value: "STATEMENT", label: "Statement (Skala)" },
          { value: "ESSAY_PROMPT", label: "Essay Prompt (Jawaban Bebas)" }
        ]
    }
  }

  useEffect(() => {
    if (question) {
      // For Self Assessment, ensure only STATEMENT is allowed
      if (instrumentType === 'SELF_ASSESSMENT') {
        form.reset({
          questionText: question.questionText,
          questionType: "STATEMENT" as const,
          scoringGuide: question.scoringGuide || "",
        })
      } else {
        // For other instruments, use the actual question type
        const resetData = {
          questionText: question.questionText,
          questionType: question.questionType as "STATEMENT" | "ESSAY_PROMPT",
          scoringGuide: question.scoringGuide || "",
        }
        form.reset(resetData as any)
      }
    }
  }, [question, form, instrumentType])

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
      <DialogContent className="max-w-lg px-8 py-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sans">Edit Pertanyaan</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Ubah detail pertanyaan di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <TooltipProvider>
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <FormLabel className="text-[13px] font-semibold leading-none">Teks Pertanyaan</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} className="cursor-pointer"><Info className="w-4 h-4 text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Pertanyaan utama yang akan ditampilkan ke pengguna.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Masukkan teks pertanyaan..."
                        className="min-h-[90px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <FormLabel className="text-[13px] font-semibold leading-none">Tipe Pertanyaan</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} className="cursor-pointer"><Info className="w-4 h-4 text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {instrumentType === 'SELF_ASSESSMENT' ? (
                            <div><span className="font-semibold">Statement (Skala):</span> Pertanyaan dengan pilihan skala (Selalu/Sering/Kadang/Tidak Pernah)</div>
                          ) : (
                            <div className="space-y-1">
                              <div><span className="font-semibold">Statement (Skala):</span> Pertanyaan dengan pilihan skala (Selalu/Sering/Kadang/Tidak Pernah)</div>
                              <div><span className="font-semibold">Essay Prompt (Jawaban Bebas):</span> Pertanyaan dengan jawaban teks bebas</div>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border border-input rounded-md focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-sm w-full">
                          <SelectValue placeholder="Pilih tipe pertanyaan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableQuestionTypes(instrumentType).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scoringGuide"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <FormLabel className="text-[13px] font-semibold leading-none">Panduan Penilaian</FormLabel>
                      <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} className="cursor-pointer"><Info className="w-4 h-4 text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Cara penilaian (misal: Selalu=4, dst). Membantu konsistensi penilaian.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[70px] border border-input rounded-md focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-sm w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TooltipProvider>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="min-w-[90px]"
              >
                Tutup
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}