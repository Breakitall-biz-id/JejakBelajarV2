"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { classWizardSchema, type ClassWizardValues } from "@/app/dashboard/admin/classroom-schemas"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import type { Option, ParticipantOption } from "./types"

type ClassWizardFormProps = {
  mode: "create" | "edit"
  defaultValues: ClassWizardValues
  termOptions: Option[]
  teacherOptions: ParticipantOption[]
  studentOptions: ParticipantOption[]
  submitLabel?: string
  onSubmit: (values: ClassWizardValues) => Promise<boolean>
  onCancel: () => void
  onStepChange?: (step: number) => void
}

type StepConfig = {
  id: string
  label: string
  description: string
  fields: Array<keyof ClassWizardValues>
}

const STEP_DEFINITIONS: StepConfig[] = [
  {
    id: "details",
    label: "Detail kelas",
    description: "Nama kelas dan tahun ajaran",
    fields: ["name", "termId"],
  },
  {
    id: "teachers",
    label: "Guru",
    description: "Pilih fasilitator kelas",
    fields: ["teacherIds"],
  },
  {
    id: "students",
    label: "Siswa",
    description: "Pilih peserta kelas",
    fields: ["studentIds"],
  },
]

export function ClassWizardForm({
  mode,
  defaultValues,
  termOptions,
  teacherOptions,
  studentOptions,
  submitLabel,
  onSubmit,
  onCancel,
  onStepChange,
}: ClassWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Notify parent component when step changes
  const handleStepChange = (step: number) => {
    setCurrentStep(step)
    onStepChange?.(step + 1) // +1 because steps are 0-indexed internally but 1-indexed for UI
  }
  const initialValuesRef = useRef(defaultValues)

  const form = useForm<ClassWizardValues>({
    resolver: zodResolver(classWizardSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    initialValuesRef.current = defaultValues
    form.reset(defaultValues)
    handleStepChange(0)
  }, [defaultValues, form])

  const isLastStep = currentStep === STEP_DEFINITIONS.length - 1
  const isSubmitting = form.formState.isSubmitting

  const teacherLookup = useMemo(
    () => new Map(teacherOptions.map((option) => [option.id, option])),
    [teacherOptions],
  )
  const studentLookup = useMemo(
    () => new Map(studentOptions.map((option) => [option.id, option])),
    [studentOptions],
  )

  const disableTeacherStep = teacherOptions.length === 0
  const disableStudentStep = studentOptions.length === 0

  const handleNext = async () => {
    const targetFields = STEP_DEFINITIONS[currentStep]?.fields ?? []
    const valid = await form.trigger(targetFields, { shouldFocus: true })
    if (!valid) return
    handleStepChange(Math.min(currentStep + 1, STEP_DEFINITIONS.length - 1))
  }

  const handleBack = () => {
    handleStepChange(Math.max(currentStep - 1, 0))
  }

  const submitHandler = form.handleSubmit(async (values) => {
    const success = await onSubmit(values)
    if (success) {
      form.reset(initialValuesRef.current)
      handleStepChange(0)
      onCancel()
    }
  })

  const currentConfig = STEP_DEFINITIONS[currentStep]

  return (
    <Form {...form}>
      <form onSubmit={submitHandler} className="space-y-0">
        {/* Horizontal Stepper with Progress Bar */}
        <nav className="mb-2">
          <div className="relative flex items-center justify-between mb-2">
            {STEP_DEFINITIONS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center">
                  <div className={`flex items-center justify-center rounded-full border transition-all duration-200 ${
                    isActive
                      ? "border-primary/80 ring-2 ring-primary/30 bg-primary text-primary-foreground shadow-md scale-105"
                      : isCompleted
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-muted bg-background text-muted-foreground"
                  }`} style={{ width: 32, height: 32 }}>
                    <span className="font-bold text-sm">{index + 1}</span>
                  </div>
                  <span className={`mt-1 text-xs font-medium tracking-wide ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                </div>
              );
            })}
            {/* Progress Bar (background) */}
            <div className="absolute left-0 right-0 top-14 -translate-y-1/2 h-0.5 bg-muted/60 z-0 rounded-full" style={{ marginLeft: 16, marginRight: 16 }} />
            {/* Progress Bar (active) */}
            <div className="absolute left-0 top-14 -translate-y-1/2 h-0.5 bg-primary/80 z-10 rounded-full transition-all duration-300" style={{ marginLeft: 16, marginRight: 16, width: `${(currentStep) / (STEP_DEFINITIONS.length - 1) * 100}%` }} />
          </div>
          <p className="text-base font-normal text-muted-foreground text-center mb-2">{currentConfig.description}</p>
        </nav>

        {/* Step Content */}
  <div className="rounded-md border border-muted shadow-md p-0 mb-4 overflow-hidden transition-all duration-300 animate-fade-in">
          {/* Illustration/Highlight for details step */}
          {currentConfig.id === "details" && (
            <div className="p-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Nama Kelas</FormLabel>
                      <FormControl>
                        <Input placeholder="cth: X IPA 1" autoFocus {...field} className="w-full text-base px-3 py-2 rounded-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-[1px] border-border transition-all duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Tahun Ajaran & Semester</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full px-3 py-2 rounded-md text-base border-[1px] border-border focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all duration-200">
                            <SelectValue placeholder="Pilih tahun ajaran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {termOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {currentConfig.id === "teachers" && (
            <div className="p-8">
              <FormField
                control={form.control}
                name="teacherIds"
                render={({ field }) => (
                  <FormItem>
                    <ParticipantChecklist
                      label="Guru Pengampu"
                      description=""
                      options={teacherOptions}
                      optionLookup={teacherLookup}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      emptyMessage="Belum ada akun guru yang tersedia."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentConfig.id === "students" && (
            <div className="p-8">
              <FormField
                control={form.control}
                name="studentIds"
                render={({ field }) => (
                  <FormItem>
                    <ParticipantChecklist
                      label="Siswa"
                      description=""
                      options={studentOptions}
                      optionLookup={studentLookup}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      emptyMessage="Belum ada akun siswa yang tersedia."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Wizard Controls */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-5 py-2 text-base font-medium"
            onClick={currentStep === 0 ? onCancel : handleBack}
            disabled={isSubmitting}
          >
            {currentStep === 0 ? "Batal" : "Kembali"}
          </Button>
          {currentStep < STEP_DEFINITIONS.length - 1 && (
            <Button
              type="button"
              className="rounded-full px-7 py-2 text-base font-bold shadow-sm"
              onClick={handleNext}
              disabled={
                isSubmitting || (currentConfig.id === "teachers" && disableTeacherStep) || (currentConfig.id === "students" && disableStudentStep)
              }
            >
              Lanjut
            </Button>
          )}
          {isLastStep && (
            <Button
              type="submit"
              className="rounded-full px-7 py-2 text-base font-bold shadow-sm"
              disabled={isSubmitting || disableStudentStep}
            >
              {isSubmitting ? "Menyimpan…" : submitLabel ?? (mode === "create" ? "Buat Kelas" : "Simpan Perubahan")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

type ParticipantChecklistProps = {
  label: string
  description: string
  options: ParticipantOption[]
  optionLookup: Map<string, ParticipantOption>
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  emptyMessage: string
}

function ParticipantChecklist({
  label,
  description,
  options,
  optionLookup,
  value,
  onChange,
  disabled,
  emptyMessage,
}: ParticipantChecklistProps) {
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  const selectedSet = useMemo(() => new Set(value ?? []), [value])

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter((option) => {
      const source = `${option.name ?? ""} ${option.email}`.toLowerCase()
      return source.includes(normalized)
    })
  }, [options, query])

  const paginatedOptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredOptions.slice(startIndex, endIndex)
  }, [filteredOptions, currentPage])

  const totalPages = Math.ceil(filteredOptions.length / itemsPerPage)

  // Reset page when search changes
  useMemo(() => {
    setCurrentPage(1)
  }, [query])

  const toggle = (id: string) => {
    const next = new Set(selectedSet)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onChange(Array.from(next))
  }

  const selectedBadges = Array.from(selectedSet).map((id) => {
    const option = optionLookup.get(id)
    return {
      id,
      label: option?.name ?? option?.email ?? id,
    }
  })

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main Selection Area */}
      <div className="flex-1 min-w-0">
        <div className="space-y-3">
          <div>
            <FormLabel>{label}</FormLabel>
            <p className="text-xs text-muted-foreground pt-4">{description}</p>
          </div>
          <Input
            placeholder="Cari berdasarkan nama atau email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled || options.length === 0}
            className="border-[1px]"
          />
          {query && (
            <p className="text-xs text-muted-foreground">
              Menampilkan {filteredOptions.length} hasil pencarian dari {options.length} {label.toLowerCase()}
            </p>
          )}
          {!query && options.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Total {options.length} {label.toLowerCase()} tersedia
            </p>
          )}

          {/* Selection List */}
          <div className="max-h-96 space-y-2 overflow-y-auto rounded-md border bg-muted/40 p-3">
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : filteredOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ditemukan akun yang cocok.</p>
            ) : (
              paginatedOptions.map((option) => {
                const checkboxId = `${label}-${option.id}`
                return (
                  <label key={option.id} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-background">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedSet.has(option.id)}
                      onCheckedChange={() => toggle(option.id)}
                      disabled={disabled}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">{option.name ?? option.email}</span>
                      <span className="text-xs text-muted-foreground">{option.email}</span>
                    </div>
                  </label>
                )
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-background border rounded-lg p-3">
              <div className="flex items-center justify-between px-1">
                <span>
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredOptions.length)} dari {filteredOptions.length} {label.toLowerCase()}
                </span>
                <span>Halaman {currentPage} dari {totalPages}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || disabled}
                  className="px-2 py-1 text-xs border border-muted rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Sebelumnya
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={disabled}
                        className={`w-6 h-6 text-xs border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || disabled}
                  className="px-2 py-1 text-xs border border-muted rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Items Sidebar */}
      <div className="lg:w-80 lg:flex-shrink-0 w-full">
        {selectedBadges.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {label} yang Dipilih ({selectedBadges.length})
              </h4>
              <button
                type="button"
                onClick={() => onChange([])}
                disabled={disabled}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Hapus Semua
              </button>
            </div>
            <div className="max-h-64 lg:max-h-96 overflow-y-auto rounded-md border bg-muted/40 p-3">
              <div className="space-y-2">
                {selectedBadges.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 bg-background rounded-md border"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = selectedBadges.filter(b => b.id !== item.id).map(b => b.id)
                        onChange(next)
                      }}
                      disabled={disabled}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="text-xs text-muted-foreground bg-background border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span>Total Terpilih:</span>
                <span className="font-semibold">{selectedBadges.length}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Sisa Tersedia:</span>
                <span className="font-semibold">{filteredOptions.length - paginatedOptions.filter(p => selectedSet.has(p.id)).length}</span>
              </div>
            </div>
          </div>
        )}

        {selectedBadges.length === 0 && (
          <div className="text-center py-8 px-4 border-2 border-dashed border-muted rounded-lg">
            <div className="text-muted-foreground">
              <div className="text-lg mb-2">📝</div>
              <p className="text-sm">Belum ada {label.toLowerCase()} yang dipilih</p>
              <p className="text-xs mt-1">
                Centang {label.toLowerCase()} dari daftar di sebelah
                <span className="hidden lg:inline"> kiri</span>
                <span className="lg:hidden"> atas</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
