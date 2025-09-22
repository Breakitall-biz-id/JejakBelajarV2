"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { StageConfigurator } from "./stage-configurator"
import { useTemplateForm } from "../hooks/useTemplateForm"
import { TemplateFormData, InstrumentConfig } from "../types"

interface TemplateWizardProps {
  onSubmit: (data: TemplateFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<TemplateFormData>
  submitButtonText?: string
  isSubmitting?: boolean
}

export function TemplateWizard({
  onSubmit,
  onCancel,
  initialData,
  submitButtonText = "Create Template",
  isSubmitting = false,
}: TemplateWizardProps) {
  const [rerenderTrigger, setRerenderTrigger] = useState(0)

  const {
    form,
    currentStep,
    nextStep,
    prevStep,
    stageFields,
    addStage,
    removeStage,
    swapStage,
    addInstrumentToStage,
    removeInstrumentFromStage,
    updateInstrument,
  } = useTemplateForm(initialData)

  const triggerRerender = useCallback(() => {
    setRerenderTrigger(prev => prev + 1)
  }, [])

  const handleSubmit = async (values: TemplateFormData) => {
    await onSubmit(values)
  }

  const handleInstrumentChange = (stageIndex: number, instrumentIndex: number, field: string, value: string) => {
    updateInstrument(stageIndex, instrumentIndex, field as keyof InstrumentConfig, value)
  }

  
  return (
    <Form {...form}>
  <form className="flex flex-col h-full" onSubmit={currentStep === 2 ? form.handleSubmit(handleSubmit) : (e) => e.preventDefault()}>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {step === 1 ? "Basic Info" : "Stage Configuration"}
                </span>
                {step < 2 && (
                  <div className={`w-16 h-0.5 mx-3 ${currentStep > step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  {...form.register("templateName")}
                  placeholder="e.g., Science Research Project Template"
                  className="mt-1"
                />
                {form.formState.errors.templateName && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.templateName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Describe the purpose and structure of this template..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <StageConfigurator
              key={rerenderTrigger}
              stageFields={stageFields}
              onRemoveStage={removeStage}
              onMoveStage={swapStage}
              onInstrumentChange={handleInstrumentChange}
              onAddInstrumentToStage={addInstrumentToStage}
              onRemoveInstrumentFromStage={removeInstrumentFromStage}
              control={form.control}
              appendStage={addStage}
              getValues={form.getValues}
              triggerRerender={triggerRerender}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/30">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep === 1 && (
              <Button type="button" onClick={nextStep}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {currentStep === 2 && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? `${submitButtonText}...` : submitButtonText}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}