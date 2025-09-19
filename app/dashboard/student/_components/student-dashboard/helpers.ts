import type { StudentDashboardData } from "../../queries"

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
      return "Evaluate your progress against the P5 competencies."
    case "PEER_ASSESSMENT":
      return "Provide constructive feedback for a group member."
    case "DAILY_NOTE":
      return "Summarise key actions or insights from today."
    default:
      return "Complete the required submission."
  }
}

export function getStageStatusBadge(
  status: StudentDashboardData["projects"][number]["stages"][number]["status"],
) {
  switch (status) {
    case "COMPLETED":
      return { label: "Completed", variant: "default" as const }
    case "IN_PROGRESS":
      return { label: "In progress", variant: "secondary" as const }
    default:
      return { label: "Locked", variant: "outline" as const }
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
