"use client"

import { useState, useCallback, useEffect } from "react"
import { toggleTemplateStatus } from "@/app/dashboard/admin/actions"
import { ProjectTemplate } from "@/app/dashboard/admin/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Play, Pause, Clock, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionsList, TemplateQuestion } from "./questions/questions-list"
import { JournalRubricsList, JournalRubric } from "./journal-rubrics/journal-rubrics-list"
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
  const [rubricsData, setRubricsData] = useState<Record<string, JournalRubric[]>>({})

  // Fetch all questions and rubrics for all configs when modal opened
  useEffect(() => {
    if (!open) return
    const fetchAll = async () => {
      // Fetch questions
      const questionEntries = await Promise.all(
        template.stageConfigs.map(async (config) => {
          try {
            const response = await fetch(`/api/admin/templates/questions?configId=${config.id}`)
            if (response.ok) {
              const data = await response.json()
              return [config.id, data.data]
            }
          } catch {}
          return [config.id, []]
        })
      )
      setQuestionsData(Object.fromEntries(questionEntries))

      // Fetch journal rubrics
      const rubricEntries = await Promise.all(
        template.stageConfigs.map(async (config) => {
          try {
            const response = await fetch(`/api/admin/templates/journal-rubrics?configId=${config.id}`)
            if (response.ok) {
              const data = await response.json()
              return [config.id, data.data]
            }
          } catch {}
          return [config.id, []]
        })
      )
      setRubricsData(Object.fromEntries(rubricEntries))
    }
    fetchAll()
  }, [open, template.stageConfigs])

  const loadQuestions = useCallback(async (configId: string) => {
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
  }, [])

  const loadRubrics = useCallback(async (configId: string) => {
    try {
      const response = await fetch(`/api/admin/templates/journal-rubrics?configId=${configId}`)
      if (response.ok) {
        const data = await response.json()
        setRubricsData(prev => ({
          ...prev,
          [configId]: data.data
        }))
      }
    } catch (error) {
      console.error("Failed to load rubrics:", error)
    }
  }, [])

  const handleToggleStatus = async () => {
    try {
      const result = await toggleTemplateStatus({ templateId: template.id })
      if (!result.success) {
        toast.error(result.error || "Failed to toggle template status")
        return
      }
      toast.success(`Template ${template.isActive ? 'dinonaktifkan' : 'diaktifkan'}!`)
    } catch (error) {
      toast.error("Failed to toggle template status")
    }
  }


  const stageGroups = template.stageConfigs.reduce((acc: Record<string, StageGroup>, config) => {
    if (!acc[config.stageName]) {
      acc[config.stageName] = {
        stageName: config.stageName,
        description: config.description ?? '',
        estimatedDuration: config.estimatedDuration ?? '',
        configs: []
      }
    }
    acc[config.stageName].configs.push({
      id: config.id,
      instrumentType: config.instrumentType,
      displayOrder: config.displayOrder,
      description: config.description ?? ''
    })
    return acc
  }, {})

  const sortedStageGroups = Object.values(stageGroups).sort((a, b) => {
    const aMinOrder = Math.min(...a.configs.map(c => c.displayOrder))
    const bMinOrder = Math.min(...b.configs.map(c => c.displayOrder))
    return aMinOrder - bMinOrder
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-card">
          <div className="px-6 pt-6 pb-2 border-b border-muted/60 relative">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-bold font-sans truncate">{template.templateName}</span>
              <span className="ml-2">
                <Badge variant={template.isActive ? "default" : "secondary"} className="text-[10px] h-5 rounded font-sans">
                  {template.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </span>
              <span className="ml-4 text-xs text-muted-foreground">Tahapan: <span className="font-bold">{sortedStageGroups.length}</span></span>
              <span className="ml-4 text-xs text-muted-foreground">Dibuat: {new Date(template.createdAt).toLocaleDateString()}</span>
          
            </div>
            {template.description && (
              <p className="text-xs text-muted-foreground font-sans mb-1">
                {template.description}
              </p>
            )}
          </div>

          <div className="p-6">
            <Tabs defaultValue={sortedStageGroups[0]?.stageName} className="w-full">
              <TabsList className="flex gap-1 bg-muted/40 rounded-md p-1 mb-4">
                {sortedStageGroups.map((stage, index) => (
                  <TabsTrigger
                    key={stage.stageName}
                    value={stage.stageName}
                    className="text-xs font-sans data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1 rounded"
                  >
                    S{index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sortedStageGroups.map((stage) => (
                <TabsContent key={stage.stageName} value={stage.stageName} className="mt-0">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-base font-sans truncate">
                        {stage.stageName}
                      </h4>
                      {stage.estimatedDuration && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {stage.estimatedDuration}
                        </span>
                      )}
                    </div>
                    {stage.description && (
                      <p className="text-xs text-muted-foreground mb-2 font-sans">
                        {stage.description}
                      </p>
                    )}
                  </div>

                  {/* Output Penilaian Tabs */}
                  <Tabs defaultValue={stage.configs[0]?.id} className="w-full">
                    <TabsList className="flex gap-1 bg-muted/30 rounded p-1 mb-2">
                      {stage.configs.map((config) => (
                        <TabsTrigger
                          key={config.id}
                          value={config.id}
                          className="text-xs font-sans data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 py-1 rounded"
                        >
                          {config.instrumentType.replace('_', ' ')}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {stage.configs.map((config) => (
                      <TabsContent key={config.id} value={config.id} className="mt-0">
                        <div className="border border-muted/40 rounded-md p-3 bg-card mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs font-sans">
                              {config.instrumentType.replace('_', ' ')}
                            </span>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1 rounded font-sans">
                              #{config.displayOrder}
                            </Badge>
                          </div>
                          {config.description && (
                            <p className="text-xs text-muted-foreground font-sans">
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
                        {config.instrumentType === "JOURNAL" && (
                          <div className="mt-4 pt-4 border-t">
                            <JournalRubricsList
                              configId={config.id}
                              instrumentType={config.instrumentType}
                              stageName={stage.stageName}
                              rubrics={rubricsData[config.id] || []}
                              onRefresh={() => loadRubrics(config.id)}
                            />
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 border-t border-muted/40 bg-muted/20 font-sans">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-[10px] h-7 px-3 font-sans">
              Tutup
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 px-3 font-sans border-primary text-primary"
              onClick={() => {/* TODO: handle edit */}}
            >
              <Edit className="mr-1 h-2 w-2" />
              Edit Template
            </Button>
            <Button
              size="sm"
              variant={template.isActive ? "ghost" : "outline"}
              className="text-[10px] h-7 px-3 font-sans border border-muted/40"
              onClick={handleToggleStatus}
            >
              {template.isActive ? (
                <>
                  <Pause className="mr-1 h-2 w-2" />
                  Nonaktifkan
                </>
              ) : (
                <>
                  <Play className="mr-1 h-2 w-2" />
                  Aktifkan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}