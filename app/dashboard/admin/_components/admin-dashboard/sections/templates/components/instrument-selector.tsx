"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { InstrumentConfig } from "../types"
import { instrumentTypes } from "../constants"

interface InstrumentSelectorProps {
  instruments: InstrumentConfig[]
  onAddInstrument: () => void
  onRemoveInstrument: (index: number) => void
  onInstrumentChange: (index: number, field: keyof InstrumentConfig, value: string) => void
}

function InstrumentItem({
  instrument,
  index,
  onRemoveInstrument,
  onInstrumentChange,
}: {
  instrument: InstrumentConfig
  index: number
  onRemoveInstrument: (index: number) => void
  onInstrumentChange: (index: number, field: keyof InstrumentConfig, value: string) => void
}) {
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Select
            value={instrument.instrumentType}
            onValueChange={(value) => onInstrumentChange(index, 'instrumentType', value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select instrument type" />
            </SelectTrigger>
            <SelectContent>
              {instrumentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveInstrument(index)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          placeholder="Add description or instructions for this instrument..."
          value={instrument.description || ""}
          onChange={(e) => onInstrumentChange(index, 'description', e.target.value)}
          className="min-h-[80px]"
        />
      </div>
    </div>
  )
}

export function InstrumentSelector({
  instruments,
  onAddInstrument,
  onRemoveInstrument,
  onInstrumentChange,
}: InstrumentSelectorProps) {
  const [localInstruments, setLocalInstruments] = useState<InstrumentConfig[]>(instruments)

  useEffect(() => {
    setLocalInstruments(instruments)
  }, [instruments])

  const handleInstrumentChange = (index: number, field: keyof InstrumentConfig, value: string) => {
    const updatedInstruments = [...localInstruments]
    updatedInstruments[index] = { ...updatedInstruments[index], [field]: value }
    setLocalInstruments(updatedInstruments)
    onInstrumentChange(index, field, value)
  }

  console.log("InstrumentSelector rendered with instruments:", localInstruments)

  return (
  <div className="space-y-3">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-base font-medium font-sans">Assessment Instruments</h4>
        <Button
          type="button"
          onClick={() => onAddInstrument()}
          size="sm"
          variant="default"
          className="font-sans"
        >
          <Plus className="h-4 w-4 mr-1" /> Tambah Instrumen
        </Button>
      </div>

      <div className="space-y-3">
        {localInstruments.map((instrument, index) => (
          <InstrumentItem
            key={index}
            instrument={instrument}
            index={index}
            onRemoveInstrument={onRemoveInstrument}
            onInstrumentChange={handleInstrumentChange}
          />
        ))}
      </div>
    </div>
  )
}