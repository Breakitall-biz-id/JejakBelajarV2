import { redirect } from "next/navigation"

import { getServerAuthSession, resolveDashboardPath } from "@/lib/auth/session"

export default async function DashboardIndexPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/sign-in")
  }

  redirect(resolveDashboardPath(session.user.role))
}
