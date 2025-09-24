
import * as React from "react"
import type { StudentDashboardData } from "../../queries"

export function ProjectProgressBar({ project }: { project: StudentDashboardData["projects"][number] }) {
  // Group stages by name (same as in ProjectDetail)
  const groupedStages = React.useMemo(() => {
    const map = new Map<string, typeof project.stages[number]>()
    for (const stage of project.stages) {
      if (!map.has(stage.name)) {
        map.set(stage.name, stage)
      } else {
        // If multiple, prefer the one with the lowest order (earliest)
        const existing = map.get(stage.name)!
        if (stage.order < existing.order) {
          map.set(stage.name, stage)
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order)
  }, [project])

  const totalStages = groupedStages.length
  const completedStages = groupedStages.filter(s => s.status === "COMPLETED").length
  const percent = totalStages === 0 ? 0 : Math.round((completedStages / totalStages) * 100)

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{percent}% selesai</span>
        <span>{completedStages}/{totalStages} Tahapan</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
