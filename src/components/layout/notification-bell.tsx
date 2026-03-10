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
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markRead.mutate({ all: true })}
              className="text-xs font-normal text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          <>
            {notifications.map((notification: { id: string; title: string; message: string; read: boolean; link?: string; createdAt: string }) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link
                  href={notification.link ?? `${basePath}/notifications`}
                  className={`flex flex-col gap-1 px-4 py-2 ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (!notification.read) {
                      markRead.mutate({ ids: [notification.id] })
                    }
                  }}
                >
                  <span className="text-sm font-medium text-gray-900">{notification.title}</span>
                  <span className="text-xs text-gray-500 line-clamp-1">{notification.message}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(notification.createdAt)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`${basePath}/notifications`}
                className="flex justify-center py-2 text-sm font-medium text-blue-600"
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
