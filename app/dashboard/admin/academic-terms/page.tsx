import { getAdminDashboardData } from "../queries"
import TermsSection from "../_components/admin-dashboard/sections/terms-section"

export default async function AcademicTermsPage() {
  const data = await getAdminDashboardData()
  return (
    <div className="p-4 lg:p-6">
      <TermsSection terms={data.terms} />
    </div>
  )
}
