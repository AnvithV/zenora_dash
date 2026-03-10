"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { UserMenu } from "@/components/layout/user-menu"
import { NotificationBell } from "@/components/layout/notification-bell"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()
  const basePath = pathname.startsWith('/admin') ? '/admin' : pathname.startsWith('/landlord') ? '/landlord' : '/dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/40 bg-white/70 px-4 backdrop-blur-xl transition-all dark:border-slate-800/60 dark:bg-slate-950/70 sm:px-6">
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

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell basePath={basePath} />
        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  )
}
