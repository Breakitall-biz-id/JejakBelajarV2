import { z } from "zod"
import { useForm } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export const formSchema = z.object({
  academicYear: z
    .string()
    .trim()
    .regex(/^[0-9]{4}\/[[0-9]{4}$/,
      "Use YYYY/YYYY format."),
  semester: z.enum(["ODD", "EVEN"]),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  setActive: z.boolean().optional(),
})

export type TermFormValues = z.infer<typeof formSchema>

export function TermFormFields({ form }: { form: ReturnType<typeof useForm<TermFormValues>> }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="academicYear"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-xs font-medium text-muted-foreground">Tahun Ajaran</FormLabel>
            <FormControl>
              <Input placeholder="2025/2026" {...field} className="h-9 px-3 text-sm" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="semester"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-xs font-medium text-muted-foreground">Semester</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full h-9 px-3 text-sm">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ODD">Ganjil</SelectItem>
                  <SelectItem value="EVEN">Genap</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="startsAt"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-xs font-medium text-muted-foreground">Mulai</FormLabel>
            <FormControl>
              <DatePicker value={field.value ?? null} onChange={field.onChange} placeholder="Pilih tanggal mulai" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="endsAt"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-xs font-medium text-muted-foreground">Selesai</FormLabel>
            <FormControl>
              <DatePicker value={field.value ?? null} onChange={field.onChange} placeholder="Pilih tanggal selesai" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="setActive"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-xs font-medium text-muted-foreground">Set sebagai Aktif</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
