"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, GripVertical, Plus } from "lucide-react"
import { StageConfig } from "../types"
import { InstrumentSelector } from "./instrument-selector"
import { useFieldArray } from "react-hook-form"

interface StageConfiguratorProps {
  stageFields: Array<{ id: string; stageName: string; description: string; estimatedDuration: string }>
  onRemoveStage: (index: number) => void
  onMoveStage: (fromIndex: number, toIndex: number) => void
  onInstrumentChange: (stageIndex: number, instrumentIndex: number, field: string, value: string) => void
  onAddInstrumentToStage: (stageIndex: number) => void
  onRemoveInstrumentFromStage: (stageIndex: number, instrumentIndex: number) => void
  control: any
  appendStage: (stage: StageConfig) => void
  getValues: (name?: string) => any
  triggerRerender: () => void
}

export function StageConfigurator({
  stageFields,
  onRemoveStage,
  onMoveStage,
  onInstrumentChange,
  onAddInstrumentToStage,
  onRemoveInstrumentFromStage,
  control,
  appendStage,
  getValues,
  triggerRerender,
}: StageConfiguratorProps) {
  const { move } = useFieldArray({ control, name: "stageConfigs" })

  const handleMoveStage = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex)
    onMoveStage(fromIndex, toIndex)
  }

  const handleAddStage = () => {
    appendStage({
      stageName: "",
      description: "",
      estimatedDuration: "",
      instruments: [{ instrumentType: "JOURNAL", description: "" }],
    })
  }

  return (
  <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold tracking-tight font-sans">Tahapan Proyek</h3>
        <Button type="button" onClick={handleAddStage} variant="outline" size="sm" className="font-sans">
          <Plus className="h-4 w-4 mr-2" /> Tambah Tahap
        </Button>
      </div>

      {stageFields.map((field, stageIndex) => (
        <div
          key={field.id}
          className="border border-border rounded-md p-4 bg-background transition group relative mb-6"
        >
          {/* Stage Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-primary font-semibold text-sm font-sans border border-muted-foreground/10">
                {stageIndex + 1}
              </span>
              <span className="text-base font-medium font-sans text-foreground">Tahap {stageIndex + 1}</span>
            </div>
            <Button
              type="button"
              onClick={() => onRemoveStage(stageIndex)}
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              aria-label="Hapus tahap"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>


          {/* Stage Inputs - Responsive Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-xs font-semibold mb-1 font-sans">Nama Tahap</label>
              <Input
                placeholder="Contoh: Eksplorasi"
                {...control.register(`stageConfigs.${stageIndex}.stageName`)}
                className="border border-border rounded-md px-3 py-2 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 font-sans">Durasi (misal: 2 minggu)</label>
              <Input
                placeholder="Durasi estimasi"
                {...control.register(`stageConfigs.${stageIndex}.estimatedDuration`)}
                className="border border-border rounded-md px-3 py-2 font-sans"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1 font-sans">Deskripsi Tahap</label>
            <Textarea
              placeholder="Jelaskan tujuan tahap ini..."
              {...control.register(`stageConfigs.${stageIndex}.description`)}
              className="min-h-[60px] border border-border rounded-md px-3 py-2 font-sans"
            />
          </div>

          {/* Instrument Selector */}
          <InstrumentSelector
            key={`${stageIndex}-${getValues(`stageConfigs.${stageIndex}.instruments`)?.length || 0}`}
            instruments={getValues(`stageConfigs.${stageIndex}.instruments`) || []}
            onAddInstrument={() => {
              onAddInstrumentToStage(stageIndex)
              triggerRerender()
            }}
            onRemoveInstrument={(instrumentIndex) => {
              onRemoveInstrumentFromStage(stageIndex, instrumentIndex)
              triggerRerender()
            }}
            onInstrumentChange={(instrumentIndex, field, value) =>
              onInstrumentChange(stageIndex, instrumentIndex, field, value)
            }
          />
        </div>
      ))}
    </div>
  )
}