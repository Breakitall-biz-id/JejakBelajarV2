
import { Metadata } from "next"
import { requireAdminUser } from "@/lib/auth/session"
import { getAdminDashboardData } from "./queries"
import { AdminDashboard } from "./_components/admin-dashboard"

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
  await requireAdminUser()
  const data = await getAdminDashboardData()
  return <AdminDashboard data={data} />
}
