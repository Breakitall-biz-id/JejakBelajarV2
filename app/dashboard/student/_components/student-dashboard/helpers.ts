import type { StudentDashboardData } from "../../queries"
import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  ClipboardList,
  Edit,
  PenLine,
  Users,
} from "lucide-react"

export const STUDENT_INSTRUMENT_TYPES = new Set([
  "JOURNAL",
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "DAILY_NOTE",
])

export function formatInstrument(instrument: string) {
  return instrument
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase())
}

export function instrumentDescription(instrument: string) {
  switch (instrument) {
    case "JOURNAL":
      return "Reflect on today’s project experience."
    case "SELF_ASSESSMENT":
      return "Evaluate your progress against the Kokurikuler competencies."
    case "PEER_ASSESSMENT":
      return "Provide constructive feedback for a group member."
    case "DAILY_NOTE":
      return "Summarise key actions or insights from today."
    default:
      return "Complete the required submission."
  }
}

type StageStatus = StudentDashboardData["projects"][number]["stages"][number]["status"]

export function getStageStatusBadge(status: StageStatus) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        variant: "outline" as const,
        badgeClassName: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        indicatorClassName: "bg-emerald-500",
      }
    case "IN_PROGRESS":
      return {
        label: "In progress",
        variant: "outline" as const,
        badgeClassName: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
        indicatorClassName: "bg-sky-500",
      }
    default:
      return {
        label: "Terkunci",
        variant: "outline" as const,
        badgeClassName: "border-muted-foreground/20 bg-muted text-muted-foreground",
        indicatorClassName: "bg-muted-foreground/40",
      }
  }
}

export function formatDate(value: string | null) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value))
  } catch (error) {
    console.warn("Unable to format date", value, error)
    return value
  }
}

export function extractSubmissionText(content: unknown) {
  if (content && typeof content === "object" && "text" in content && typeof (content as any).text === "string") {
    return (content as { text: string }).text
  }
  if (typeof content === "string") {
    return content
  }
  return ""
}

const instrumentIconMap: Record<string, LucideIcon> = {
  JOURNAL: PenLine,
  SELF_ASSESSMENT: ClipboardList,
  PEER_ASSESSMENT: Users,
  DAILY_NOTE: BookOpen,
}

export function getInstrumentIcon(instrument: string): LucideIcon {
  return instrumentIconMap[instrument] ?? Edit
}
