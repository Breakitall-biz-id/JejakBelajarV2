"use client"

import { useState, useEffect, useCallback } from "react"
import { toggleTemplateStatus } from "@/app/dashboard/admin/actions"
import { ProjectTemplate } from "@/app/dashboard/admin/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Settings, FileText, Play, Pause, Clock, Target, Layers, X, Plus } from "lucide-react"
import { QuestionsList, TemplateQuestion } from "./questions/questions-list"
import { toast } from "sonner"

interface StageGroup {
  stageName: string
  description: string
  estimatedDuration: string
  configs: Array<{
    id: string
    instrumentType: string
    displayOrder: number
    description: string
  }>
}

type TemplateDetailsDialogProps = {
  template: ProjectTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateDetailsDialog({
  template,
  open,
  onOpenChange,
}: TemplateDetailsDialogProps) {
  const [questionsData, setQuestionsData] = useState<Record<string, TemplateQuestion[]>>({})

  const loadQuestions = useCallback(async (configId: string) => {
    if (questionsData[configId]) return

    try {
      const response = await fetch(`/api/admin/templates/questions?configId=${configId}`)
      if (response.ok) {
        const data = await response.json()
        setQuestionsData(prev => ({
          ...prev,
          [configId]: data.data
        }))
      }
    } catch (error) {
      console.error("Failed to load questions:", error)
    }
  }, [questionsData])

  // Group stage configs by stage name
  const stageGroups = template.stageConfigs.reduce((acc: Record<string, StageGroup>, config) => {
    if (!acc[config.stageName]) {
      acc[config.stageName] = {
        stageName: config.stageName,
        description: config.description,
        estimatedDuration: config.estimatedDuration,
        configs: []
      }
    }
    acc[config.stageName].configs.push({
      id: config.id,
      instrumentType: config.instrumentType,
      displayOrder: config.displayOrder,
      description: config.description
    })
    return acc
  }, {})

  // Sort groups by the minimum displayOrder of their configs
  const sortedStageGroups = Object.values(stageGroups).sort((a, b) => {
    const aMinOrder = Math.min(...a.configs.map(c => c.displayOrder))
    const bMinOrder = Math.min(...b.configs.map(c => c.displayOrder))
    return aMinOrder - bMinOrder
  })

  // Load questions for all stage configs when dialog opens
  useEffect(() => {
    if (open && template.stageConfigs.length > 0) {
      template.stageConfigs.forEach(config => {
        loadQuestions(config.id)
      })
    }
  }, [open, template.stageConfigs, loadQuestions])

  const handleToggleStatus = async () => {
    try {
      const result = await toggleTemplateStatus({ templateId: template.id })

      if (!result.success) {
        toast.error(result.error || "Failed to toggle template status")
        return
      }

      toast.success(`Template ${template.isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch (error) {
      toast.error("Failed to toggle template status")
      console.error(error)
    }
  }

  const getInstrumentColor = (type: string) => {
    switch (type) {
      case 'JOURNAL': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'SELF_ASSESSMENT': return 'bg-green-100 text-green-700 border-green-200'
      case 'PEER_ASSESSMENT': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'OBSERVATION': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getInstrumentIcon = (type: string) => {
    switch (type) {
      case 'JOURNAL': return '📝'
      case 'SELF_ASSESSMENT': return '👤'
      case 'PEER_ASSESSMENT': return '👥'
      case 'OBSERVATION': return '👁️'
      default: return '📋'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-background border-0 shadow-xl">
        {/* Ultra Compact Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white">
              <FileText className="h-3 w-3" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{template.templateName}</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground">
                Template configuration and assessment stages
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={template.isActive ? "default" : "secondary"} className="text-[10px] h-5">
              {template.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-5 w-5 p-0"
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>

        {/* Two-column Layout */}
        <div className="flex h-[calc(85vh-80px)]">
          {/* Left Sidebar - Ultra Compact Info */}
          <div className="w-48 border-r bg-muted/10 p-3 space-y-3">
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Overview
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Status</span>
                  <Badge variant={template.isActive ? "default" : "secondary"} className="text-[9px] h-4 px-1.5">
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Stages</span>
                  <span className="text-xs font-medium">{sortedStageGroups.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Created</span>
                  <span className="text-[10px]">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {template.description && (
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {template.description}
                </p>
              </div>
            )}

            <div className="pt-2 border-t space-y-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                className="w-full text-[10px] h-7 px-2"
              >
                {template.isActive ? (
                  <>
                    <Pause className="mr-1 h-2.5 w-2.5" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-2.5 w-2.5" />
                    Activate
                  </>
                )}
              </Button>
              <Button size="sm" className="w-full text-[10px] h-7 px-2">
                <Edit className="mr-1 h-2.5 w-2.5" />
                Edit Template
              </Button>
            </div>
          </div>

          {/* Main Content - Ultra Compact Layout */}
          <div className="flex-1 flex flex-col">
            {/* Ultra Compact Tabs */}
            <div className="p-2 border-b bg-muted/5">
              <Tabs defaultValue={sortedStageGroups[0]?.stageName} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5 h-6">
                  {sortedStageGroups.map((stage, index) => (
                    <TabsTrigger
                      key={stage.stageName}
                      value={stage.stageName}
                      className="text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white h-5 px-1"
                    >
                      S{index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-2 space-y-2">
                  {sortedStageGroups.map((stage, index) => (
                    <TabsContent key={stage.stageName} value={stage.stageName} className="space-y-2 mt-0">
                      {/* Ultra Compact Stage Header */}
                      <div className="border border-border rounded p-2 bg-card">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs mb-1 truncate">
                              {stage.stageName}
                            </h4>
                            <div className="flex flex-wrap gap-0.5 mb-1">
                              {stage.configs.map((config) => (
                                <Badge
                                  key={config.id}
                                  variant="outline"
                                  className={`text-[9px] h-4 px-1 ${getInstrumentColor(config.instrumentType)}`}
                                >
                                  <span className="mr-0.5 text-[8px]">{getInstrumentIcon(config.instrumentType)}</span>
                                  {config.instrumentType.split('_')[0]}
                                </Badge>
                              ))}
                            </div>
                            {stage.description && (
                              <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                                {stage.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="text-base font-bold text-blue-600">
                              {stage.configs.length}
                            </p>
                            <p className="text-[8px] text-muted-foreground">
                              output{stage.configs.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {stage.estimatedDuration && (
                          <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground pt-0.5 border-t">
                            <Clock className="h-2.5 w-2.5" />
                            {stage.estimatedDuration}
                          </div>
                        )}
                      </div>

                      {/* Instruments Section */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Assessment Outputs
                        </h5>

                        {stage.configs.length === 1 ? (
                          /* Single Instrument - Ultra Compact */
                          <div className="border border-border rounded p-2 bg-card">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{getInstrumentIcon(stage.configs[0].instrumentType)}</span>
                                <span className="text-xs font-medium">
                                  {stage.configs[0].instrumentType.replace('_', ' ')}
                                </span>
                                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                  #{stage.configs[0].displayOrder}
                                </Badge>
                              </div>
                            </div>

                            {stage.configs[0].description && (
                              <p className="text-[10px] text-muted-foreground mb-1 leading-tight">
                                {stage.configs[0].description}
                              </p>
                            )}

                            <div className="border-t pt-1">
                              <QuestionsList
                                configId={stage.configs[0].id}
                                instrumentType={stage.configs[0].instrumentType}
                                stageName={stage.stageName}
                                questions={questionsData[stage.configs[0].id] || []}
                                onRefresh={() => loadQuestions(stage.configs[0].id)}
                              />
                            </div>
                          </div>
                        ) : (
                          /* Multiple Instruments - Ultra Compact Tabs */
                          <Tabs defaultValue={stage.configs[0]?.id} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 gap-0.5 h-5">
                              {stage.configs.map((config) => (
                                <TabsTrigger
                                  key={config.id}
                                  value={config.id}
                                  className="text-[9px] data-[state=active]:bg-blue-600 data-[state=active]:text-white h-4 px-1"
                                >
                                  <span className="mr-0.5 text-[8px]">{getInstrumentIcon(config.instrumentType)}</span>
                                  {config.instrumentType.split('_')[0]}
                                </TabsTrigger>
                              ))}
                            </TabsList>

                            {stage.configs.map((config) => (
                              <TabsContent key={config.id} value={config.id} className="space-y-1 mt-1">
                                <div className="border border-border rounded p-2 bg-card">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm">{getInstrumentIcon(config.instrumentType)}</span>
                                      <span className="text-xs font-medium">
                                        {config.instrumentType.replace('_', ' ')}
                                      </span>
                                      <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                        #{config.displayOrder}
                                      </Badge>
                                    </div>
                                  </div>

                                  {config.description && (
                                    <p className="text-[10px] text-muted-foreground leading-tight">
                                      {config.description}
                                    </p>
                                  )}
                                </div>

                                <QuestionsList
                                  configId={config.id}
                                  instrumentType={config.instrumentType}
                                  stageName={stage.stageName}
                                  questions={questionsData[config.id] || []}
                                  onRefresh={() => loadQuestions(config.id)}
                                />
                              </TabsContent>
                            ))}
                          </Tabs>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Ultra Compact Footer */}
        <DialogFooter className="flex items-center justify-between p-2 border-t bg-muted/30">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-[10px] h-7 px-3">
            Close
          </Button>
          <Button size="sm" className="text-[10px] h-7 px-3">
            <Edit className="mr-1 h-2.5 w-2.5" />
            Edit Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}