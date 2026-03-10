"use client"

import { Bell } from "lucide-react"
import Link from "next/link"
import { useNotifications, useMarkNotificationsRead } from "@/hooks/use-notifications"
import { formatDateTime } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NotificationBellProps {
  basePath: string // "/admin" or "/dashboard"
}

export function NotificationBell({ basePath }: NotificationBellProps) {
  const { data } = useNotifications({ pageSize: 5 })
  const markRead = useMarkNotificationsRead()

  const unreadCount = data?.unreadCount ?? 0
  const notifications = data?.items ?? []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus-visible:ring-violet-400"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-slate-900 dark:text-slate-100">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markRead.mutate({ all: true })}
              className="text-xs font-normal text-violet-600 transition-colors hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            No notifications
          </div>
        ) : (
          <>
            {notifications.map((notification: { id: string; title: string; message: string; read: boolean; link?: string; createdAt: string }) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link
                  href={notification.link ?? `${basePath}/notifications`}
                  className={`flex flex-col gap-1 px-4 py-2.5 ${!notification.read ? 'bg-violet-50/60 dark:bg-violet-900/10' : ''}`}
                  onClick={() => {
                    if (!notification.read) {
                      markRead.mutate({ ids: [notification.id] })
                    }
                  }}
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{notification.title}</span>
                  <span className="text-xs text-slate-500 line-clamp-1 dark:text-slate-400">{notification.message}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(notification.createdAt)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`${basePath}/notifications`}
                className="flex justify-center py-2 text-sm font-medium text-violet-600 dark:text-violet-400"
              >
                View All
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
