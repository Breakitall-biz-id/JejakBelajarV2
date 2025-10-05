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
  IconLayoutKanban,
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
  { title: "Beranda", url: "/dashboard/admin", icon: IconDashboard },
  { title: "Tahun Ajaran", url: "/dashboard/admin/academic-terms", icon: IconCalendarEvent },
  { title: "Kelas & Siswa", url: "/dashboard/admin/classes", icon: IconClipboardList },
  { title: "Akun Pengguna", url: "/dashboard/admin/accounts", icon: IconUsers },
  { title: "Template Proyek", url: "/dashboard/admin/templates", icon: IconLayoutKanban },
  { title: "Laporan", url: "/dashboard/admin/reports", icon: IconChartBar },
]

const teacherNav: Array<{ title: string; url: string; icon: Icon }> = [
  { title: "Beranda", url: "/dashboard/teacher", icon: IconDashboard },
  { title: "Penilaian & Feedback", url: "/dashboard/teacher/review", icon: IconClipboardList },
  { title: "Laporan & Ekspor", url: "/dashboard/teacher/reports", icon: IconReport },
]

const studentNav: Array<{ title: string; url: string; icon: Icon }> = [
  { title: "Beranda", url: "/dashboard/student", icon: IconDashboard },
]


const secondaryNav = [
  { title: "Pengaturan", url: "#", icon: IconSettings },
  { title: "Bantuan", url: "#", icon: IconHelp },
  { title: "Pencarian", url: "#", icon: IconSearch },
]

type ExtendedRole = UserRole | "GUEST"

const NAV_BY_ROLE: Record<ExtendedRole, Array<{ title: string; url: string; icon: Icon }>> = {
  ADMIN: adminNav,
  TEACHER: teacherNav,
  STUDENT: studentNav,
  GUEST: [{ title: "Beranda", url: "/dashboard", icon: IconDashboard }],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialRole?: UserRole | null
  initialUser?: CurrentUser | null
}

export function AppSidebar({ initialRole, initialUser, ...props }: AppSidebarProps) {
  const { data: session } = useSession()

  const resolvedRole = (session?.user?.role ?? initialRole ?? "GUEST") as ExtendedRole
  const userNav = NAV_BY_ROLE[resolvedRole]

  const userData = useMemo(() => {
    const fallback = {
      name: "Tamu",
      email: "tamu@example.com",
      avatar: "/codeguide-logo.png",
    }

    const activeUser = session?.user ?? initialUser

    if (!activeUser) {
      return fallback
    }

    return {
      name: activeUser.name || "Pengguna",
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
