"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { templateSchema, TemplateFormData, StageConfig, InstrumentConfig } from "../types"

export function useTemplateForm(defaultTemplate?: Partial<TemplateFormData>) {
  const [currentStep, setCurrentStep] = useState(1)

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateName: defaultTemplate?.templateName || "",
      description: defaultTemplate?.description || "",
      stageConfigs: defaultTemplate?.stageConfigs || [
        {
          stageName: "",
          description: "",
          estimatedDuration: "",
          instruments: [{ instrumentType: "JOURNAL", description: "", configId: undefined }],
        },
      ],
    },
  })

  const { fields: stageFields, append: appendStage, remove: removeStage, swap: swapStage } =
    useFieldArray({ control: form.control, name: "stageConfigs" })

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

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1))

  const addStage = () => {
    appendStage({
      stageName: "",
      description: "",
      estimatedDuration: "",
      instruments: [{ instrumentType: "JOURNAL", description: "", configId: undefined }],
    })
  }

  const addInstrumentToStage = (stageIndex: number) => {
    const currentStage = form.getValues(`stageConfigs.${stageIndex}`)
    const instruments = currentStage.instruments || []

    form.setValue(`stageConfigs.${stageIndex}.instruments`, [
      ...instruments,
      { instrumentType: "JOURNAL", description: "", configId: undefined } // ✅ New instruments don't have configId
    ])
  }

  const removeInstrumentFromStage = (stageIndex: number, instrumentIndex: number) => {
    const currentStage = form.getValues(`stageConfigs.${stageIndex}`)
    const instruments = currentStage.instruments || []

    if (instruments.length > 1) {
      form.setValue(`stageConfigs.${stageIndex}.instruments`,
        instruments.filter((_, index) => index !== instrumentIndex)
      )
    }
  }

  const updateInstrument = (stageIndex: number, instrumentIndex: number, field: keyof InstrumentConfig, value: string) => {
    form.setValue(`stageConfigs.${stageIndex}.instruments.${instrumentIndex}.${field}`, value)
  }

  return {
    form,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    stageFields,
    addStage,
    removeStage,
    swapStage,
    addInstrumentToStage,
    removeInstrumentFromStage,
    updateInstrument,
  }
}