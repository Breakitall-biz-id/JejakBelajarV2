import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function JournalAssessmentDialog({
  open,
  onOpenChange,
  prompt,
  initialValue,
  onSubmit,
  loading,
  readOnly,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: string
  initialValue?: string
  onSubmit: (value: string) => void
  loading?: boolean
  readOnly?: boolean
}) {
  const [value, setValue] = React.useState(initialValue || "")
  React.useEffect(() => { setValue(initialValue || "") }, [initialValue, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Refleksi (Journal)</DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-sm text-muted-foreground">{prompt}</div>
        <Textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={8}
          placeholder="Tulis refleksi kamu di sini..."
          className="resize-none"
          disabled={readOnly}
        />
        <DialogFooter>
          <Button onClick={() => onSubmit(value)} disabled={loading || !value.trim() || readOnly}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
