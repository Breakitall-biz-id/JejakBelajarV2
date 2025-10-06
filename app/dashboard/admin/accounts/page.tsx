


import { Metadata } from "next"
import { getAdminDashboardData } from "../queries"

import { AccountRow } from "../_components/admin-dashboard/sections/accounts-table"
import { AccountsTabsClient } from "../_components/admin-dashboard/sections/accounts-tabs-client"

export const metadata: Metadata = {
  title: "Akun • JejakBelajar",
}


export default async function AdminAccountsPage() {
  const data = await getAdminDashboardData();

  const teacherRows: AccountRow[] = data.teachers.map((t) => ({
    id: t.id,
    name: t.name ?? "",
    email: t.email,
    createdAt: t.createdAt,
    memberships: data.teacherClasses[t.id] ?? [],
  }));
  const studentRows: AccountRow[] = data.students.map((s) => ({
    id: s.id,
    name: s.name ?? "",
    email: s.email,
    createdAt: s.createdAt,
    memberships: data.studentClasses[s.id] ?? [],
  }));

  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <AccountsTabsClient teacherRows={teacherRows} studentRows={studentRows} />
    </div>
  );
}
