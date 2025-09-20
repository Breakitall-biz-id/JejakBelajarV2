"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo } from "react"

import { useSession } from "@/lib/auth-client"
import {
  IconCalendarEvent,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconClipboardList,
} from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { CurrentUser } from "@/lib/auth/session"
import type { UserRole } from "@/db/schema/auth"

const adminNav: Array<{ title: string; url: string; icon: Icon }> = [
  { title: "Overview", url: "/dashboard/admin", icon: IconDashboard },
  { title: "Academic Terms", url: "/dashboard/admin/academic-terms", icon: IconCalendarEvent },
  { title: "Classes & Cohorts", url: "/dashboard/admin/classes", icon: IconClipboardList },
  { title: "Accounts", url: "/dashboard/admin/accounts", icon: IconUsers },
  { title: "Reports", url: "/dashboard/admin/reports", icon: IconChartBar },
]

const teacherNav: Array<{ title: string; url: string; icon: Icon }> = [
  { title: "Overview", url: "/dashboard/teacher", icon: IconDashboard },
  { title: "Review & Feedback", url: "/dashboard/teacher/review", icon: IconClipboardList },
  { title: "Reports & Exports", url: "/dashboard/teacher/reports", icon: IconReport },
]

const studentNav: Array<{ title: string; url: string; icon: Icon }> = [
  { title: "My Projects", url: "/dashboard/student", icon: IconDashboard },
]

const adminResources = [
  { name: "Data Library", url: "#", icon: IconDatabase },
  { name: "Reports", url: "#", icon: IconReport },
  { name: "Word Assistant", url: "#", icon: IconFileWord },
]

const secondaryNav = [
  { title: "Settings", url: "#", icon: IconSettings },
  { title: "Get Help", url: "#", icon: IconHelp },
  { title: "Search", url: "#", icon: IconSearch },
]

type ExtendedRole = UserRole | "GUEST"

const NAV_BY_ROLE: Record<ExtendedRole, Array<{ title: string; url: string; icon: Icon }>> = {
  ADMIN: adminNav,
  TEACHER: teacherNav,
  STUDENT: studentNav,
  GUEST: [{ title: "Dashboard", url: "/dashboard", icon: IconDashboard }],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialRole?: UserRole | null
  initialUser?: CurrentUser | null
}

export function AppSidebar({ initialRole, initialUser, ...props }: AppSidebarProps) {
  const { data: session } = useSession()

  const resolvedRole = (session?.user?.role ?? initialRole ?? "GUEST") as ExtendedRole
  const userNav = NAV_BY_ROLE[resolvedRole]
  const showQuickAction = resolvedRole === "ADMIN"
  const showResources = resolvedRole === "ADMIN"

  const userData = useMemo(() => {
    const fallback = {
      name: "Guest",
      email: "guest@example.com",
      avatar: "/codeguide-logo.png",
    }

    const activeUser = session?.user ?? initialUser

    if (!activeUser) {
      return fallback
    }

    return {
      name: activeUser.name || "User",
      email: activeUser.email,
      avatar: activeUser.image || "/codeguide-logo.png",
    }
  }, [initialUser, session?.user])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <Image src="/codeguide-logo.png" alt="JejakBelajar" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">JejakBelajar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={userNav} showQuickAction={false} />
        {/* {showResources && <NavDocuments items={adminResources} />} */}
        <NavSecondary items={secondaryNav} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
