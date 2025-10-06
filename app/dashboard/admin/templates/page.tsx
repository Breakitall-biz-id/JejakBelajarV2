import { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  ForbiddenError,
  getServerAuthSession,
  requireAdminUser,
  resolveDashboardPath,
} from "@/lib/auth/session"

import { TemplatesClient } from "./_components/templates-client"
import { getAdminDashboardData } from "../queries"

export const metadata: Metadata = {
  title: "Manajemen Template • JejakBelajar",
}

export default async function AdminTemplatesPage() {
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
    <TemplatesClient data={data} />
  )
}