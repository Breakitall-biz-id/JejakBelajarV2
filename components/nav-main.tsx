"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  url: string
  icon?: Icon
}

type NavMainProps = {
  items: NavItem[]
  showQuickAction?: boolean
}

export function NavMain({ items, showQuickAction = true }: NavMainProps) {
  const pathname = usePathname()

  const getIsActive = (url: string) => {
    if (!url || url === "#") return false

    const normalize = (value: string) => {
      if (!value) return "/"
      if (value === "/") return "/"
      const trimmed = value.replace(/\/+$/, "")
      return trimmed.length ? trimmed : "/"
    }

    const target = normalize(url)
    const path = normalize(pathname)

    if (path === target) {
      return true
    }

    const segmentCount = target.split("/").filter(Boolean).length
    const allowNested = segmentCount > 2

    if (allowNested && path.startsWith(target + "/")) {
      return true
    }

    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {showQuickAction && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="min-w-8 rounded-xl bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:text-primary-foreground"
              >
                <IconCirclePlusFilled />
                <span>Quick Create</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => {
            const active = getIsActive(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ease-out",
                    "before:absolute before:inset-y-1 before:left-1 before:w-1 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity before:duration-300",
                    active
                      ? "bg-primary/10 text-primary shadow-sm before:opacity-100"
                      : "text-muted-foreground hover:-translate-y-0.5 hover:bg-muted/50 hover:text-foreground before:group-hover:opacity-60",
                  )}
                >
                  <Link
                    href={item.url}
                    className="flex w-full items-center gap-3"
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-300",
                        active
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-transparent bg-muted/40 text-muted-foreground",
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                    </span>
                    <span className="font-medium leading-none">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
