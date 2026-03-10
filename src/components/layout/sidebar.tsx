"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeftClose, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { adminNavItems, userNavItems } from "@/lib/navigation"
import { APP_NAME } from "@/lib/constants"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out dark:border-slate-800/60 dark:bg-slate-950/95",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-slate-200/60 dark:border-slate-800",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {!collapsed ? (
            <Link
              href={isAdmin ? "/admin/users" : "/dashboard/overview"}
              className="flex items-center gap-2.5 group"
            >
              <span className="text-lg font-bold bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-violet-300">
                {APP_NAME}
              </span>
            </Link>
          ) : (
            <Link
              href={isAdmin ? "/admin/users" : "/dashboard/overview"}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-violet-600 dark:text-violet-400"
            >
              Z
            </Link>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label="Expand sidebar"
              className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-1 px-3" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200",
                    collapsed && "justify-center px-2"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active indicator - left border accent */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-violet-500 dark:bg-violet-400" />
                  )}
                  <Icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                  )} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return <React.Fragment key={item.href}>{linkContent}</React.Fragment>
            })}
          </nav>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  )
}
