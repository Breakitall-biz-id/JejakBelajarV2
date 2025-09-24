"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

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

const createQuestionSchema = (instrumentType: string) => z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: getQuestionTypeEnum(instrumentType),
  scoringGuide: z.string().optional(),
})

type CreateQuestionSchema = z.infer<ReturnType<typeof createQuestionSchema>>

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
    resolver: zodResolver(createQuestionSchema(instrumentType)),
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
      case 'OBSERVATION':
      default:
        return ""
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg px-8 py-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sans">Buat Pertanyaan Baru</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Untuk <span className="font-semibold">{getInstrumentTypeLabel(instrumentType)}</span>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        placeholder={getScoringGuidePlaceholder(instrumentType)}
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
                {isSubmitting ? "Membuat..." : "Buat Pertanyaan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}