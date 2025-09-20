import { getAdminDashboardData } from "../queries"
import { ClassesSection } from "../_components/admin-dashboard/sections/classes-section"

export default async function ClassesPage() {
  const data = await getAdminDashboardData()
  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <ClassesSection
        classes={data.classes}
        terms={data.terms}
        teachers={data.teachers}
        students={data.students}
        assignments={data.assignments}
      />
    </div>
  )
}
