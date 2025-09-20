"use client"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar, Hash } from "lucide-react"

type TemplateQuestion = {
  id: string
  questionText: string
  questionType: string
  scoringGuide: string | null
  createdAt: string
}

type QuestionDetailsDialogProps = {
  question: TemplateQuestion
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuestionDetailsDialog({
  question,
  open,
  onOpenChange,
}: QuestionDetailsDialogProps) {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'STATEMENT':
        return 'Statement'
      case 'ESSAY_PROMPT':
        return 'Essay Prompt'
      default:
        return type
    }
  }

  const getQuestionTypeDescription = (type: string) => {
    switch (type) {
      case 'STATEMENT':
        return 'For rating scale questions where users respond with options like Always/Often/Sometimes/Never'
      case 'ESSAY_PROMPT':
        return 'For open-ended written responses where users provide detailed answers'
      default:
        return 'Standard question type'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
          <DialogDescription>
            View detailed information about this assessment question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Question Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Question Text
                </label>
                <p className="mt-1 text-sm leading-relaxed bg-muted p-3 rounded-md">
                  {question.questionText}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Question Type
                  </label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {getQuestionTypeLabel(question.questionType)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getQuestionTypeDescription(question.questionType)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Question ID
                  </label>
                  <div className="mt-1 flex items-center gap-1">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {question.id}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scoring Guide</CardTitle>
            </CardHeader>
            <CardContent>
              {question.scoringGuide ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Scoring Criteria
                  </label>
                  <p className="text-sm leading-relaxed bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {question.scoringGuide}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No scoring guide defined</p>
                  <p className="text-xs mt-1">
                    This question doesn&apos;t have specific scoring criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Created Date
                  </label>
                  <p className="mt-1">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Created Time
                  </label>
                  <p className="mt-1">
                    {new Date(question.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}