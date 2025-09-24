import type { StudentDashboardData } from "../../queries"

export function ProjectMeta({ project }: { project: StudentDashboardData["projects"][number] }) {
  // Hitung total instrumen di semua stage
  const totalInstrumen = project.stages.reduce((acc, s) => acc + s.requiredInstruments.length, 0)
  // Hitung instrumen yang sudah submit
  const completedInstrumen = project.stages.reduce((acc, s) => {
    return acc + (s.requiredInstruments.filter(i => s.submissionsByInstrument?.[i.instrumentType]?.length > 0).length)
  }, 0)

  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
      <span>Instrumen: <b>{completedInstrumen}</b>/{totalInstrumen}</span>
      <span>Tahapan: <b>{project.stages.filter(s => s.status === 'COMPLETED').length}</b>/{project.stages.length}</span>
    </div>
  )
}
