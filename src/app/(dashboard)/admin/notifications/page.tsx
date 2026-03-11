'use client'

import { useState } from 'react'
import { useNotifications, useMarkNotificationsRead } from '@/hooks/use-notifications'
import { Bell, Check, CheckCheck, Info, AlertTriangle, MessageSquare, FileText, Wrench, Users, DollarSign, UserCheck, UserX } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const typeIcons: Record<string, React.ElementType> = {
  MESSAGE: MessageSquare,
  new_message: MessageSquare,
  MAINTENANCE: Wrench,
  LEASE: FileText,
  PAYMENT: DollarSign,
  APPLICATION: Users,
  WARNING: AlertTriangle,
  INFO: Info,
  document_shared: FileText,
  role_changed: UserCheck,
  account_approved: UserCheck,
  account_suspended: UserX,
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const readParam = filter === 'unread' ? 'false' : filter === 'read' ? 'true' : undefined
  const { data, isLoading } = useNotifications({ read: readParam, page, pageSize: 20 })
  const markRead = useMarkNotificationsRead()

  const notifications = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const unreadCount = data?.unreadCount ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markRead.mutate({ all: true })}
            disabled={markRead.isPending}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => { setFilter(''); setPage(1) }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(1) }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => { setFilter('read'); setPage(1) }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notification List */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-12 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12">
            <Bell className="h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(
              (notification: {
                id: string
                type: string
                title: string
                message: string
                read: boolean
                link?: string
                createdAt: string
              }) => {
                const Icon = typeIcons[notification.type] ?? Bell
                return (
                  <div
                    key={notification.id}
                    className={`flex cursor-pointer items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markRead.mutate({ ids: [notification.id] })
                      }
                      if (notification.link) {
                        router.push(notification.link)
                      }
                    }}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        !notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <span className="flex-shrink-0 text-xs text-gray-400">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markRead.mutate({ ids: [notification.id] })
                        }}
                        className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )
              },
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
