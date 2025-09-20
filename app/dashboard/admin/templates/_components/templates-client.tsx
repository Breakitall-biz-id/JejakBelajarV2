"use client"

import { usePathname } from "next/navigation"
import { AdminDashboard } from "../../_components/admin-dashboard/admin-dashboard"
import type { AdminDashboardData } from "../../queries"

type TemplatesClientProps = {
  data: AdminDashboardData
}

export function TemplatesClient({ data }: TemplatesClientProps) {
  const pathname = usePathname()

  const shouldShowTemplates = pathname === "/dashboard/admin/templates"

  return (
    <AdminDashboard data={data} initialSection={shouldShowTemplates ? "templates" : "overview"} />
  )
}