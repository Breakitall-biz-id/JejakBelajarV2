"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateJournalRubricDialog } from "./create-journal-rubric-dialog"
import { EditJournalRubricDialog } from "./edit-journal-rubric-dialog"
import { toast } from "sonner"

export type JournalRubric = {
  id: string
  indicatorText: string
  criteria: { [score: string]: string }
  createdAt: string
}

type JournalRubricsListProps = {
  configId: string
  instrumentType: string
  stageName: string
  rubrics: JournalRubric[]
  onRefresh?: () => void
}

export function JournalRubricsList({
  configId,
  instrumentType,
  stageName,
  rubrics = [],
  onRefresh
}: JournalRubricsListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedRubric, setSelectedRubric] = useState<JournalRubric | null>(null)

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    onRefresh?.()
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    onRefresh?.()
  }

  const handleDelete = async (rubricId: string) => {
    try {
      const response = await fetch(`/api/admin/templates/journal-rubrics/${rubricId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete rubric')
      }

      toast.success('Rubric deleted successfully')
      onRefresh?.()
    } catch (error) {
      toast.error('Failed to delete rubric')
    }
  }

  const handleEdit = (rubric: JournalRubric) => {
    setSelectedRubric(rubric)
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Journal Rubrics ({rubrics.length})
        </h4>
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="text-xs h-7 px-3"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Rubric
        </Button>
      </div>

      {rubrics.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
          <p className="text-sm">No rubrics defined yet</p>
          <p className="text-xs mt-1">Add rubrics to assess journal submissions</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rubrics.map((rubric) => (
            <div key={rubric.id} className="border rounded-lg p-3 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="text-sm font-medium mb-2">{rubric.indicatorText}</h5>
                  <div className="space-y-1">
                    {Object.entries(rubric.criteria).map(([score, description]) => (
                      <div key={score} className="text-xs flex items-center gap-2">
                        <span className="font-medium min-w-[40px] bg-muted px-1 rounded text-center">
                          {score}
                        </span>
                        <span className="text-muted-foreground">{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(rubric)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(rubric.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateJournalRubricDialog
          configId={configId}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Dialog */}
      {showEditDialog && selectedRubric && (
        <EditJournalRubricDialog
          rubric={selectedRubric}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}