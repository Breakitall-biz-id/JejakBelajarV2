import * as React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle } from "lucide-react"

export type InstrumentChecklistItemProps = {
  instrumentType: string
  title: string
  status: "done" | "pending" | "waiting"
  onAction?: () => void
  actionLabel?: string
  disabled?: boolean
}

export function InstrumentChecklistItem({ instrumentType, title, status, onAction, actionLabel, disabled }: InstrumentChecklistItemProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      {status === "done" ? (
        <CheckCircle2 className="text-green-500 w-5 h-5" />
      ) : status === "waiting" ? (
        <Circle className="text-muted-foreground w-5 h-5" />
      ) : (
        <Circle className="text-yellow-500 w-5 h-5" />
      )}
      <span className="flex-1 text-sm font-medium text-foreground">{title}</span>
      {onAction && actionLabel && (
        <Button size="sm" variant="outline" onClick={onAction} disabled={disabled}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
