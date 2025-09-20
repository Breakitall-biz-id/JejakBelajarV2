"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Copy, ArrowLeft, ArrowRight, Check, LayoutDashboard, X } from "lucide-react"
import { toast } from "sonner"
import { createTemplate } from "@/app/dashboard/admin/actions"

const instrumentConfigSchema = z.object({
  instrumentType: z.enum(["JOURNAL", "SELF_ASSESSMENT", "PEER_ASSESSMENT", "OBSERVATION"]),
  description: z.string().optional(),
})

const stageConfigSchema = z.object({
  stageName: z.string().min(1, "Stage name is required"),
  description: z.string().optional(),
  estimatedDuration: z.string().optional(),
  instruments: z.array(instrumentConfigSchema).min(1, "At least one instrument is required"),
})

const templateSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  stageConfigs: z.array(stageConfigSchema).min(1, "At least one stage configuration is required"),
})

type TemplateFormData = z.infer<typeof templateSchema>
type StageConfigFormData = z.infer<typeof stageConfigSchema>
type InstrumentConfigFormData = z.infer<typeof instrumentConfigSchema>

const instrumentTypes = [
  { value: "JOURNAL", label: "Reflection Journal", description: "Text-based reflection entries" },
  { value: "SELF_ASSESSMENT", label: "Self-Assessment", description: "Student self-evaluation questionnaire" },
  { value: "PEER_ASSESSMENT", label: "Peer Assessment", description: "Peer-to-peer evaluation form" },
  { value: "OBSERVATION", label: "Observation", description: "Teacher observation rubric" },
]

type CreateTemplateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTemplateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateName: "",
      description: "",
      stageConfigs: [
        {
          stageName: "",
          description: "",
          estimatedDuration: "",
          instruments: [
            {
              instrumentType: "JOURNAL",
              description: "",
            },
          ],
        },
      ],
    },
  })

  const { fields: stageFields, append: appendStage, remove: removeStage, swap: swapStage } = useFieldArray({
    control: form.control,
    name: "stageConfigs",
  })

  const onSubmit = async (values: TemplateFormData) => {
    setIsSubmitting(true)
    try {
      // Transform the data to match the expected format
      const transformedData = {
        templateName: values.templateName,
        description: values.description,
        stageConfigs: values.stageConfigs.flatMap((stage, stageIndex) =>
          stage.instruments.map((instrument, instrumentIndex) => ({
            stageName: stage.stageName,
            instrumentType: instrument.instrumentType,
            description: instrument.description || stage.description || "",
            estimatedDuration: stage.estimatedDuration || "",
            displayOrder: stageIndex * 100 + instrumentIndex,
          }))
        ),
      }

      const result = await createTemplate(transformedData)

      if (!result.success) {
        toast.error(result.error || "Failed to create template")
        return
      }

      toast.success("Template created successfully!")
      onSuccess()
    } catch (error) {
      toast.error("Failed to create template")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addStageConfig = () => {
    appendStage({
      stageName: "",
      description: "",
      estimatedDuration: "",
      instruments: [
        {
          instrumentType: "JOURNAL",
          description: "",
        },
      ],
    })
  }

  const moveStage = (fromIndex: number, toIndex: number) => {
    swapStage(fromIndex, toIndex)
  }

  const addInstrumentToStage = (stageIndex: number) => {
    const currentInstruments = form.getValues(`stageConfigs.${stageIndex}.instruments`)
    const existingTypes = currentInstruments.map(i => i.instrumentType)
    const availableTypes = instrumentTypes.filter(t => !existingTypes.includes(t.value as any))

    if (availableTypes.length > 0) {
      form.setValue(`stageConfigs.${stageIndex}.instruments`, [
        ...currentInstruments,
        {
          instrumentType: availableTypes[0].value as any,
          description: "",
        },
      ])
    }
  }

  const removeInstrumentFromStage = (stageIndex: number, instrumentIndex: number) => {
    const currentInstruments = form.getValues(`stageConfigs.${stageIndex}.instruments`)
    if (currentInstruments.length > 1) {
      form.setValue(`stageConfigs.${stageIndex}.instruments`,
        currentInstruments.filter((_, i) => i !== instrumentIndex)
      )
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      const templateName = form.getValues("templateName")
      if (!templateName.trim()) {
        form.setError("templateName", { message: "Template name is required" })
        return
      }
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNext = () => {
    if (currentStep === 1) {
      return form.watch("templateName").trim() !== ""
    }
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-background border-0 shadow-2xl">
        {/* Header - Notion style */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Create New Template</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Set up a new project template for your classroom
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps - Clean minimal design */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-8">
            <div className={`flex items-center gap-3 ${currentStep === 1 ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-muted-foreground text-white'
              }`}>
                {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
              </div>
              <span className="text-sm font-medium">Basic Info</span>
            </div>

            <div className={`flex items-center gap-3 ${currentStep === 2 ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-muted-foreground/30 text-muted-foreground'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Assessment Stages</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            {/* Step 1: Basic Information - Notion style */}
            {currentStep === 1 && (
              <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Template Name
                    </label>
                    <Input
                      {...form.register("templateName")}
                      placeholder="e.g., Science Research Project"
                      className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-600"
                    />
                    {form.formState.errors.templateName && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.templateName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Description
                    </label>
                    <Textarea
                      {...form.register("description")}
                      placeholder="Describe what students will learn and create..."
                      className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-600 resize-none min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Stage Configurations - Notion style */}
            {currentStep === 2 && (
              <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Assessment Stages</h3>
                  <Button type="button" variant="outline" onClick={addStageConfig} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stage
                  </Button>
                </div>

                {stageFields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <div className="text-muted-foreground">
                      <Plus className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No stages added yet</p>
                      <Button type="button" onClick={addStageConfig} variant="ghost" className="mt-2">
                        Add your first stage
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stageFields.map((field, stageIndex) => (
                      <div key={field.id} className="border border-border rounded-lg p-4 space-y-4">
                        {/* Stage Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center">
                              {stageIndex + 1}
                            </div>
                            <div className="font-medium">Stage {stageIndex + 1}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stageIndex > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveStage(stageIndex, stageIndex - 1)}
                                className="h-6 w-6 p-0"
                              >
                                ↑
                              </Button>
                            )}
                            {stageIndex < stageFields.length - 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveStage(stageIndex, stageIndex + 1)}
                                className="h-6 w-6 p-0"
                              >
                                ↓
                              </Button>
                            )}
                            {stageFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStage(stageIndex)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Stage Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Stage Name
                            </label>
                            <Input
                              {...form.register(`stageConfigs.${stageIndex}.stageName`)}
                              placeholder="e.g., Planning Phase"
                              className="border border-border rounded-md px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Duration
                            </label>
                            <Input
                              {...form.register(`stageConfigs.${stageIndex}.estimatedDuration`)}
                              placeholder="e.g., 2-3 weeks"
                              className="border border-border rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">
                            Stage Description
                          </label>
                          <Textarea
                            {...form.register(`stageConfigs.${stageIndex}.description`)}
                            placeholder="What will students do in this stage?"
                            className="border border-border rounded-md px-3 py-2 text-sm resize-none min-h-[80px]"
                          />
                        </div>

                        {/* Instruments Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-foreground">
                              Assessment Outputs
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addInstrumentToStage(stageIndex)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add Output
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {form.watch(`stageConfigs.${stageIndex}.instruments`)?.map((instrument, instrumentIndex) => (
                              <div key={instrumentIndex} className="p-3 bg-muted/30 rounded-md space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <select
                                      {...form.register(`stageConfigs.${stageIndex}.instruments.${instrumentIndex}.instrumentType`)}
                                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                                    >
                                      {instrumentTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                          {type.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeInstrumentFromStage(stageIndex, instrumentIndex)}
                                    className="h-6 w-6 p-0 text-red-600"
                                    disabled={form.watch(`stageConfigs.${stageIndex}.instruments`)?.length === 1}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* Special interface for Journal type */}
                                {form.watch(`stageConfigs.${stageIndex}.instruments.${instrumentIndex}.instrumentType`) === "JOURNAL" && (
                                  <div className="border border-border rounded-lg overflow-hidden">
                                    <div className="bg-blue-50 border-b border-blue-100 p-2">
                                      <label className="text-xs font-medium text-blue-700">
                                        Reflection Journal Prompt
                                      </label>
                                      <p className="text-xs text-blue-600 mt-1">
                                        Students will write free-form text entries based on your guidance
                                      </p>
                                    </div>
                                    <div className="p-3">
                                      <Textarea
                                        {...form.register(`stageConfigs.${stageIndex}.instruments.${instrumentIndex}.description`)}
                                        placeholder="Provide guidance for student reflections... What should they focus on? What questions should they consider?"
                                        className="w-full border border-border rounded-md px-3 py-2 text-sm min-h-[100px] resize-none"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Interface for other instrument types */}
                                {form.watch(`stageConfigs.${stageIndex}.instruments.${instrumentIndex}.instrumentType`) !== "JOURNAL" && (
                                  <div className="border border-border rounded-lg overflow-hidden">
                                    <div className="bg-orange-50 border-b border-orange-100 p-2">
                                      <label className="text-xs font-medium text-orange-700">
                                        Questionnaire Configuration
                                      </label>
                                      <p className="text-xs text-orange-600 mt-1">
                                        Students will answer structured questions that you'll create later
                                      </p>
                                    </div>
                                    <div className="p-3">
                                      <Textarea
                                        {...form.register(`stageConfigs.${stageIndex}.instruments.${instrumentIndex}.description`)}
                                        placeholder="Describe the focus areas and types of questions to include..."
                                        className="w-full border border-border rounded-md px-3 py-2 text-sm min-h-[80px] resize-none"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer - Notion style */}
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <Button type="button" variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                {currentStep === 1 ? (
                  <Button type="button" onClick={nextStep} disabled={!canProceedToNext()}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Creating..." : "Create Template"}
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}