"use client"

import { useState } from "react"
import { Filter, Calendar, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import format from "date-fns/format"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterOptions {
  dateRange?: DateRange
  termId?: string
  classId?: string
  projectStatus?: string
  teacherId?: string
}

interface ReportsFilterProps {
  onFiltersChange: (filters: FilterOptions) => void
  availableTerms?: { id: string; name: string; status: string }[]
  availableClasses?: { id: string; name: string; teacherId: string }[]
  availableTeachers?: { id: string; name: string }[]
}

export function ReportsFilter({
  onFiltersChange,
  availableTerms = [],
  availableClasses = [],
  availableTeachers = []
}: ReportsFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilter = (filterKey: keyof FilterOptions) => {
    const updatedFilters = { ...filters }
    delete updatedFilters[filterKey]
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(filters).filter(key =>
    filters[key as keyof FilterOptions] !== undefined
  ).length

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return ""
    if (!range?.to) return format(range.from, "dd MMM yyyy")
    return `${format(range.from, "dd MMM yyyy")} - ${format(range.to, "dd MMM yyyy")}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filter Laporan</CardTitle>
            <CardDescription>Sempurnakan data yang ditampilkan dengan filter</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} filter aktif
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rentang Tanggal</label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(dateRange) => updateFilters({ dateRange })}
            />
            {filters.dateRange && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDateRange(filters.dateRange)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('dateRange')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Term Filter */}
          {availableTerms.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Periode Akademik</label>
              <Select
                value={filters.termId || ""}
                onValueChange={(value) => updateFilters({ termId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode akademik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua periode</SelectItem>
                  {availableTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name} {term.status === "ACTIVE" && "(Aktif)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.termId && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Periode: {availableTerms.find(t => t.id === filters.termId)?.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('termId')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Class Filter */}
          {availableClasses.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Kelas</label>
              <Select
                value={filters.classId || ""}
                onValueChange={(value) => updateFilters({ classId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua kelas</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.classId && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Kelas: {availableClasses.find(c => c.id === filters.classId)?.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('classId')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Teacher Filter */}
          {availableTeachers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Guru</label>
              <Select
                value={filters.teacherId || ""}
                onValueChange={(value) => updateFilters({ teacherId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua guru</SelectItem>
                  {availableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.teacherId && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Guru: {availableTeachers.find(t => t.id === filters.teacherId)?.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('teacherId')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={activeFiltersCount === 0}
            >
              Hapus semua filter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}