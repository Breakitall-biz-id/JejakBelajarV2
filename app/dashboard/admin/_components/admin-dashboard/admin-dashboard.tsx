"use client"

import { useCallback, useMemo, useState } from "react"
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Layers3,
  Users,
  } from "lucide-react"

import type { AdminDashboardData } from "../../queries"

import { AccountsSection } from "./sections/accounts-section"
import { ClassesSection } from "./sections/classes-section"
import TermsSection from "./sections/terms-section"
import { OverviewSection } from "./sections/overview-section"
import { ReportsSection } from "./sections/reports-section"
import { TemplatesSection } from "./sections/templates-section"
import { cn } from "@/lib/utils"

type AdminDashboardProps = {
  data: AdminDashboardData
  initialSection?: string
}

type NavItem = {
  id: string
  label: string
  description: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Key metrics and health checks",
    icon: LayoutDashboard,
  },
  {
    id: "terms",
    label: "Academic Terms",
    description: "Control active semesters",
    icon: CalendarDays,
  },
  {
    id: "classes",
    label: "Classes & Cohorts",
    description: "Manage class rosters",
    icon: Layers3,
  },
  {
    id: "accounts",
    label: "Accounts",
    description: "Teacher & student directory",
    icon: Users,
  },
  {
    id: "templates",
    label: "Templates",
    description: "Project templates & configurations",
    icon: LayoutDashboard,
  },
  {
    id: "reports",
    label: "Reports",
    description: "Exports and analytics",
    icon: BarChart3,
  },
]

export function AdminDashboard({ data, initialSection }: AdminDashboardProps) {
  const [active, setActive] = useState<string>(initialSection || NAV_ITEMS[0]!.id)

  const handleNavigate = useCallback((section: string) => {
    setActive(section)
  }, [])

  const renderedSection = useMemo(() => {
    switch (active) {
      case "overview":
        return (
          <section id="overview" className="space-y-6">
            <OverviewSection data={data} onNavigate={handleNavigate} />
          </section>
        )
      case "terms":
        return (
          <section id="terms" className="space-y-6">
            <TermsSection terms={data.terms} />
          </section>
        )
      case "classes":
        return (
          <section id="classes" className="space-y-6">
            <ClassesSection
              classes={data.classes}
              terms={data.terms}
              teachers={data.teachers}
              students={data.students}
              assignments={data.assignments}
            />
          </section>
        )
      case "accounts":
        return (
          <section id="accounts" className="space-y-6">
            <AccountsSection
              teachers={data.teachers}
              students={data.students}
              teacherClasses={data.teacherClasses}
              studentClasses={data.studentClasses}
            />
          </section>
        )
      case "templates":
        return (
          <section id="templates" className="space-y-6">
            <TemplatesSection templates={data.templates} />
          </section>
        )
      case "reports":
        return (
          <section id="reports" className="space-y-6">
            <ReportsSection data={data} />
          </section>
        )
      default:
        return null
    }
  }, [active, data, handleNavigate])

  return (
    <div className="space-y-8 px-4 pb-10 pt-6 lg:px-8">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">School Console</p>
          <h1 className="mt-1 text-2xl font-semibold">JejakBelajar Admin</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Monitor academic terms, cohorts, and user accounts from a single hub tailored to the P5 implementation.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
                    : "border-transparent bg-muted/60 text-muted-foreground hover:-translate-y-0.5 hover:border-muted/80 hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                    isActive ? "border-primary/30 bg-primary/20" : "border-transparent bg-muted/40",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </header>

      <div key={active} className="space-y-10 animate-section-fade">
        {renderedSection}
      </div>
    </div>
  )
}
