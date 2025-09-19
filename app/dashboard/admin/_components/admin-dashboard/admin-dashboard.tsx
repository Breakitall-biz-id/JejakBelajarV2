"use client"

import { useState } from "react"

import type { AdminDashboardData } from "../../queries"

import { AccountsSection } from "./sections/accounts-section"
import { ClassesSection } from "./sections/classes-section"

type AdminDashboardProps = {
  data: AdminDashboardData
}

const NAV_ITEMS = [
  { id: "terms", label: "Tahun Akademik" },
  { id: "classes", label: "Kelas" },
  { id: "accounts", label: "Akun" },
]

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [active, setActive] = useState<string>(NAV_ITEMS[0]!.id)

  return (
    <div className="grid gap-6 px-4 pb-8 pt-4 lg:grid-cols-[260px_1fr] lg:px-6">
      <aside className="rounded-xl border bg-background p-4">
        <h1 className="text-lg font-semibold">Admin Console</h1>
        <p className="text-sm text-muted-foreground">
          Configure school data, manage user accounts, and assign facilitators to classes.
        </p>
        <nav className="mt-6 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted ${
                active === item.id ? "bg-muted font-semibold" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="space-y-6">
        {active === "classes" && (
          <ClassesSection
            classes={data.classes}
            terms={data.terms}
          />
        )}
        {active === "accounts" && (
          <AccountsSection teachers={data.teachers} students={data.students} />
        )}
      </main>
    </div>
  )
}
