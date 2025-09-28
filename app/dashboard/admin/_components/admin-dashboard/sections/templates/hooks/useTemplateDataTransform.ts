import { ProjectTemplate } from "@/app/dashboard/admin/queries"
import { TemplateFormData, StageConfig, InstrumentConfig } from "../types"

interface StageConfigWithIds extends StageConfig {
  instruments: Array<InstrumentConfig & { configId?: string }>
}

export function transformTemplateToFormData(template: ProjectTemplate): TemplateFormData {
  const stageGroups = template.stageConfigs.reduce((acc, config) => {
    if (!acc[config.stageName]) {
      acc[config.stageName] = {
        stageName: config.stageName,
        description: config.description || undefined,
        estimatedDuration: config.estimatedDuration || undefined,
        instruments: [],
      }
    }
    acc[config.stageName].instruments.push({
      instrumentType: config.instrumentType as "JOURNAL" | "SELF_ASSESSMENT" | "PEER_ASSESSMENT" | "OBSERVATION",
      description: config.description || undefined,
      configId: config.id, // ✅ Preserve the configId for existing instruments
    })
    return acc
  }, {} as Record<string, StageConfigWithIds>)

  return {
    templateName: template.templateName,
    description: template.description || "",
    stageConfigs: Object.values(stageGroups),
  }
}