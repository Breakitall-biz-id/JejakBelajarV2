
import { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  ForbiddenError,
  getServerAuthSession,
  requireAdminUser,
  resolveDashboardPath,
} from "@/lib/auth/session"
import { getAdminDashboardData } from "./queries"
import { OverviewSection } from "./_components/admin-dashboard/sections/overview-section"

export const metadata: Metadata = {
  title: "School Administration • JejakBelajar",
}

type SerializableTerm = {
  id: string
  academicYear: string
  semester: string
  status: string
  startsAt: string | null
  endsAt: string | null
  createdAt: string
}

type SerializableClass = {
  id: string
  name: string
  academicTermId: string
  createdAt: string
}

const serializeDate = (value: Date | null) => value?.toISOString() ?? null


export default async function AdminDashboardPage() {
  try {
    await requireAdminUser()
  } catch (error) {
    if (error instanceof ForbiddenError) {
      const session = await getServerAuthSession()

      if (!session) {
        redirect("/sign-in")
      }

      redirect(resolveDashboardPath(session.user.role))
    }

    throw error
  }

  const data = await getAdminDashboardData()
  return (
    <div className="space-y-8 px-4 pb-10 pt-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">School Console</p>
        <h1 className="text-2xl font-semibold">JejakBelajar Admin</h1>
        <p className="text-sm text-muted-foreground">
          Monitor academic health, quickly access cohorts, and keep user accounts up to date from this overview.
        </p>
      </header>
      <OverviewSection data={data} />
    </div>
  )
}
