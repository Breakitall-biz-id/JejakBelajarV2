import { getAdminDashboardData } from "../queries"
import TermsSection from "../_components/admin-dashboard/sections/terms-section"

export default async function AcademicTermsPage() {
  const data = await getAdminDashboardData()
  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <TermsSection terms={data.terms} />
    </div>
  )
}
