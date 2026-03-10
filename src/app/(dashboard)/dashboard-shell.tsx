"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface DashboardShellProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
