
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
  title: "Administrasi Sekolah • JejakBelajar",
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
      <OverviewSection data={data} />
    </div>
  )
}
