import { z } from "zod"

export const instrumentConfigSchema = z.object({
  instrumentType: z.enum(["JOURNAL", "SELF_ASSESSMENT", "PEER_ASSESSMENT", "OBSERVATION"]),
  description: z.string().optional(),
  configId: z.string().optional(),
})

export const stageConfigSchema = z.object({
  stageName: z.string().min(1, "Stage name is required"),
  description: z.string().optional(),
  estimatedDuration: z.string().optional(),
  instruments: z.array(instrumentConfigSchema).min(1, "At least one instrument is required"),
})

export const templateSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  stageConfigs: z.array(stageConfigSchema).min(1, "At least one stage configuration is required"),
})

export type InstrumentConfig = z.infer<typeof instrumentConfigSchema>
export type StageConfig = z.infer<typeof stageConfigSchema>
export type TemplateFormData = z.infer<typeof templateSchema>