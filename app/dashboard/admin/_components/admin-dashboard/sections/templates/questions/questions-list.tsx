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
import { CreateQuestionDialog } from "./create-question-dialog"
import { EditQuestionDialog } from "./edit-question-dialog"
import { toast } from "sonner"

export type TemplateQuestion = {
  id: string
  questionText: string
  questionType: string
  scoringGuide: string | null
  createdAt: string
}

type QuestionsListProps = {
  configId: string
  instrumentType: string
  stageName: string
  questions: TemplateQuestion[]
  onRefresh?: () => void
}

export function QuestionsList({
  configId,
  instrumentType,
  stageName,
  questions = [],
  onRefresh
}: QuestionsListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<TemplateQuestion | null>(null)

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    onRefresh?.()
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    onRefresh?.()
  }

  const handleDeleteQuestion = async (question: TemplateQuestion) => {
    try {
      const response = await fetch(`/api/admin/templates/questions/${question.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete question')
      }

      toast.success("Statement deleted successfully!")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to delete statement")
      console.error(error)
    }
  }

  const handleEditQuestion = (question: TemplateQuestion) => {
    setSelectedQuestion(question)
    setShowEditDialog(true)
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

  // Journal instruments don't need questions
  if (instrumentType === 'JOURNAL') {
    return null
  }

  return (
    <div className="space-y-1">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h4 className="text-xs font-medium">Statements</h4>
          <span className="text-[9px] text-muted-foreground">
            ({questions.length})
          </span>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="sm"
          variant="outline"
          className="text-[9px] h-5 px-1.5"
          title="Add new statement"
        >
          <Plus className="h-2 w-2" />
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-3 border border-dashed border-border rounded text-[10px] text-muted-foreground">
          No statements yet
        </div>
      ) : (
        <div className="space-y-1 max-h-[40vh] overflow-y-auto">
          {questions.map((question) => (
            <div key={question.id} className="flex items-center justify-between p-2 border border-border rounded text-xs">
              <div className="flex-1 min-w-0">
                <div
                  className="break-words whitespace-pre-line text-[10px]"
                  title={question.questionText.replace(/<[^>]+>/g, '')}
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />
              </div>
              <div className="flex items-center gap-1 ml-2">
                {question.scoringGuide && (
                  <div
                    className="w-2 h-2 rounded-full bg-blue-500 cursor-help"
                    title={`Scoring: ${question.scoringGuide}`}
                  />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4 p-0">
                      <MoreHorizontal className="h-2 w-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs min-w-[120px]">
                    <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteQuestion(question)}
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

        {showCreateDialog && (
          <CreateQuestionDialog
            configId={configId}
            instrumentType={instrumentType}
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={handleCreateSuccess}
          />
        )}

        {showEditDialog && selectedQuestion && (
          <EditQuestionDialog
            question={selectedQuestion}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onSuccess={handleEditSuccess}
          />
        )}

        </div>
  )
}