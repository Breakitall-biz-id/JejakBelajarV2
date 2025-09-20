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
}: ClassWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const initialValuesRef = useRef(defaultValues)

  const form = useForm<ClassWizardValues>({
    resolver: zodResolver(classWizardSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    initialValuesRef.current = defaultValues
    form.reset(defaultValues)
    setCurrentStep(0)
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
    setCurrentStep((prev) => Math.min(prev + 1, STEP_DEFINITIONS.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const submitHandler = form.handleSubmit(async (values) => {
    const success = await onSubmit(values)
    if (success) {
      form.reset(initialValuesRef.current)
      setCurrentStep(0)
      onCancel()
    }
  })

  const currentConfig = STEP_DEFINITIONS[currentStep]

  return (
    <Form {...form}>
      <form onSubmit={submitHandler} className="space-y-6">
        <nav className="flex flex-col gap-3">
          <ol className="flex flex-wrap items-center gap-3">
            {STEP_DEFINITIONS.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              return (
                <li
                  key={step.id}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : isCompleted
                        ? "border-muted bg-muted/70 text-muted-foreground"
                        : "border-transparent bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border bg-background text-[11px]">
                    {index + 1}
                  </span>
                  <span>{step.label}</span>
                </li>
              )
            })}
          </ol>
          <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
        </nav>

        {currentConfig.id === "details" && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama kelas</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: X IPA 1" autoFocus {...field} />
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
                  <FormLabel>Tahun ajaran & semester</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
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
        )}

        {currentConfig.id === "teachers" && (
          <FormField
            control={form.control}
            name="teacherIds"
            render={({ field }) => (
              <FormItem>
                <ParticipantChecklist
                  label="Pilih guru pengampu"
                  description="Guru dapat menangani lebih dari satu kelas."
                  options={teacherOptions}
                  optionLookup={teacherLookup}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  emptyMessage="Belum ada akun guru yang tersedia. Buat akun guru terlebih dahulu."
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentConfig.id === "students" && (
          <FormField
            control={form.control}
            name="studentIds"
            render={({ field }) => (
              <FormItem>
                <ParticipantChecklist
                  label="Pilih siswa"
                  description="Siswa yang sudah bergabung tetap dapat ditambahkan ke kelas lain bila diperlukan."
                  options={studentOptions}
                  optionLookup={studentLookup}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  emptyMessage="Belum ada akun siswa yang tersedia. Buat akun siswa terlebih dahulu."
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={currentStep === 0 ? onCancel : handleBack} disabled={isSubmitting}>
            {currentStep === 0 ? "Batal" : "Kembali"}
          </Button>
          <div className="flex items-center gap-2">
            {currentStep < STEP_DEFINITIONS.length - 1 && (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  isSubmitting || (currentConfig.id === "teachers" && disableTeacherStep) || (currentConfig.id === "students" && disableStudentStep)
                }
              >
                Lanjut
              </Button>
            )}
            {isLastStep && (
              <Button type="submit" disabled={isSubmitting || disableStudentStep}>
                {isSubmitting ? "Menyimpan…" : submitLabel ?? (mode === "create" ? "Buat Kelas" : "Simpan Perubahan")}
              </Button>
            )}
          </div>
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
  const selectedSet = useMemo(() => new Set(value ?? []), [value])

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter((option) => {
      const source = `${option.name ?? ""} ${option.email}`.toLowerCase()
      return source.includes(normalized)
    })
  }, [options, query])

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
    <div className="space-y-3">
      <div>
        <FormLabel>{label}</FormLabel>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Input
        placeholder="Cari berdasarkan nama atau email"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        disabled={disabled || options.length === 0}
      />
      <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border bg-muted/40 p-3">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : filteredOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ditemukan akun yang cocok.</p>
        ) : (
          filteredOptions.map((option) => {
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
      {selectedBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBadges.map((item) => (
            <Badge key={item.id} variant="secondary">
              {item.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
