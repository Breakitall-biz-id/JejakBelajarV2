import { Metadata } from "next"

import { getAdminDashboardData } from "../queries"
import { AccountsSection } from "../_components/admin-dashboard/sections/accounts-section"

export const metadata: Metadata = {
  title: "Accounts • JejakBelajar",
}

export default async function AdminAccountsPage() {
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <AccountsSection
        teachers={data.teachers}
        students={data.students}
        teacherClasses={data.teacherClasses}
        studentClasses={data.studentClasses}
      />
    </div>
  )
}
