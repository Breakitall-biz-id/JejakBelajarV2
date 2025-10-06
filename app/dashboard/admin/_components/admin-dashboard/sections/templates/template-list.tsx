"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Plus, Edit, Trash2, Eye, LayoutDashboard, Calendar, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TemplateDetailsDialog } from "./template-details-dialog"
import { EditTemplateDialog } from "./edit-template-dialog"
import { toast } from "sonner"
import { ProjectTemplate } from "@/app/dashboard/admin/queries"
import { deleteTemplate } from "@/app/dashboard/admin/actions"
import { CreateTemplateDialog } from "./create-template-dialog"

type TemplateListProps = {
  templates: ProjectTemplate[]
}

export function TemplateList({ templates = [] }: TemplateListProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const handleViewDetails = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setShowDetailsDialog(true)
  }

  const handleEditTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setShowEditDialog(true)
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setSelectedTemplate(null)
  }

  const handleDeleteTemplate = async (template: ProjectTemplate) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus template "${template.templateName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    try {
      const result = await deleteTemplate({ templateId: template.id })

      if (!result.success) {
        toast.error(result.error || "Gagal menghapus template")
        return
      }

      toast.success("Template berhasil dihapus!")
    } catch (error) {
      toast.error("Gagal menghapus template")
      console.error(error)
    }
  }

  const getInstrumentTypes = (template: ProjectTemplate) => {
    const types = template.stageConfigs.map(config => config.instrumentType)
    return [...new Set(types)] // Remove duplicates
  }

  const getStageCount = (template: ProjectTemplate) => {
    const names = new Set(template.stageConfigs.map(cfg => cfg.stageName))
    return names.size
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Template Proyek</h2>
          <p className="text-muted-foreground">
            Kelola template proyek yang dapat digunakan guru untuk proyek Kokurikuler mereka
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Buat Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum ada template</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Buat template proyek pertama Anda untuk memulai. Template membantu guru menyusun proyek Kokurikuler secara konsisten.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Buat Template Pertama Anda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {template.templateName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
                        {template.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getStageCount(template)} tahapan
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleViewDetails(template)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteTemplate(template)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Description */}
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}

                {/* Instrument Types */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Instrumen Penilaian:</p>
                  <div className="flex flex-wrap gap-1">
                    {getInstrumentTypes(template).map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {getStageCount(template)} tahapan
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(template)}
                    className="text-xs"
                  >
                    Lihat Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateTemplateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditDialog && selectedTemplate && (
        <EditTemplateDialog
          template={selectedTemplate}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDetailsDialog && selectedTemplate && (
        <TemplateDetailsDialog
          template={selectedTemplate}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </div>
  )
}