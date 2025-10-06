"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (date: DateRange | undefined) => void
  placeholder?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  ...props
}: DateRangePickerProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd LLL y", { locale: id })} -{" "}
                  {format(value.to, "dd LLL y", { locale: id })}
                </>
              ) : (
                format(value.from, "dd LLL y", { locale: id })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={id}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const id = {
  localize: (month: string) => {
    const months: { [key: string]: string } = {
      January: 'Januari',
      February: 'Februari',
      March: 'Maret',
      April: 'April',
      May: 'Mei',
      June: 'Juni',
      July: 'Juli',
      August: 'Agustus',
      September: 'September',
      October: 'Oktober',
      November: 'November',
      December: 'Desember'
    }
    return months[month] || month
  },
  formatLong: {
    date: () => 'dd LLL y'
  }
}