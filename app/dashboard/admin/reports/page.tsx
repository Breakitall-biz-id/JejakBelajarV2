import { Metadata } from "next"

import { getAdminDashboardData } from "../queries"
import { ReportsSection } from "../_components/admin-dashboard/sections/reports-section"

export const metadata: Metadata = {
  title: "Reports • JejakBelajar",
}

export default async function AdminReportsPage() {
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <ReportsSection data={data} />
    </div>
  )
}
