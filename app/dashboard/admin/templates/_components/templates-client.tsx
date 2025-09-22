"use client"

import type { AdminDashboardData } from "../../queries"
import { TemplatesSection } from "../../_components/admin-dashboard/sections/templates-section"

type TemplatesClientProps = {
  data: AdminDashboardData
}

export function TemplatesClient({ data }: TemplatesClientProps) {
  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <TemplatesSection templates={data.templates} />
    </div>
  )
}