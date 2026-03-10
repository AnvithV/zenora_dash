"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { UserMenu } from "@/components/layout/user-menu"
import { NotificationBell } from "@/components/layout/notification-bell"
import { isAdminRole } from "@/lib/auth-utils"

interface HeaderProps {
  onMobileMenuToggle: () => void
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
  onSignOut: () => void
}

export function Header({ onMobileMenuToggle, user, onSignOut }: HeaderProps) {
  const basePath = isAdminRole((user.role ?? '') as 'PLATFORM_ADMIN' | 'LANDLORD' | 'TENANT') ? '/admin' : '/dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/60 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden sm:block">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <NotificationBell basePath={basePath} />
        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  )
}
