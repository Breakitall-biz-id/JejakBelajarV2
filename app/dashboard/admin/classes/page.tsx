import { getAdminDashboardData } from "../queries"
import { ClassesSection } from "../_components/admin-dashboard/sections/classes-section"

export default async function ClassesPage() {
  const data = await getAdminDashboardData()
  return (
    <div className="p-4 lg:p-6">
      <ClassesSection classes={data.classes} terms={data.terms} />
    </div>
  )
}
