'use client'

import { useAdminOverview } from '@/hooks/use-admin-overview'
import { useUsers } from '@/hooks/use-users'
import { useConversations } from '@/hooks/use-messages'
import { useNotifications } from '@/hooks/use-notifications'
import { Building2, Home, FileText, Wrench, Users, ClipboardList, MessageSquare, Bell, UserCheck } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

function StatCard({ title, value, icon: Icon, description, href, highlight }: {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  href?: string
  highlight?: boolean
}) {
  const content = (
    <div className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow ${highlight ? 'border-yellow-200 bg-yellow-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className={`rounded-full p-3 ${highlight ? 'bg-yellow-100' : 'bg-blue-50'}`}>
          <Icon className={`h-6 w-6 ${highlight ? 'text-yellow-600' : 'text-blue-600'}`} />
        </div>
      </div>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

export default function AdminOverviewPage() {
  const { data, isLoading, error } = useAdminOverview()
  const { data: pendingUsersData } = useUsers({ status: 'PENDING', pageSize: 1 })
  const { data: conversationsData } = useConversations()
  const { data: notificationsData } = useNotifications({ pageSize: 5 })

  const pendingCount = pendingUsersData?.total ?? 0
  const unreadMessages = (conversationsData?.data ?? []).reduce(
    (sum: number, c: { unreadCount: number }) => sum + (c.unreadCount ?? 0),
    0,
  )
  const unreadNotifications = notificationsData?.unreadCount ?? 0
  const recentNotifications = notificationsData?.items ?? []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-700">Failed to load dashboard data: {error.message}</p>
      </div>
    )
  }

  const properties = data?.properties ?? { total: 0, active: 0 }
  const units = data?.units ?? { total: 0, occupied: 0, occupancyRate: 0 }
  const leases = data?.leases ?? { total: 0, active: 0, expiring: 0, expired: 0 }
  const maintenance = data?.maintenance ?? { total: 0, open: 0, inProgress: 0, resolved: 0, urgent: 0 }
  const applications = data?.applications ?? { total: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0 }
  const recentActivity = data?.recentActivity ?? []
  const users = data?.users ?? { total: 0, active: 0, tenants: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome to ZenPortal admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pendingCount > 0 && (
          <StatCard
            title="Pending Users"
            value={pendingCount}
            icon={UserCheck}
            description="Awaiting approval"
            href="/admin/users?status=PENDING"
            highlight
          />
        )}
        {unreadMessages > 0 && (
          <StatCard
            title="Unread Messages"
            value={unreadMessages}
            icon={MessageSquare}
            description="New messages"
            href="/admin/messages"
          />
        )}
        <StatCard
          title="Properties"
          value={properties?.total ?? 0}
          icon={Building2}
          description={`${properties?.active ?? 0} active`}
          href="/admin/properties"
        />
        <StatCard
          title="Units"
          value={units?.total ?? 0}
          icon={Home}
          description={`${units?.occupancyRate ?? 0}% occupancy`}
          href="/admin/units"
        />
        <StatCard
          title="Active Leases"
          value={leases?.active ?? 0}
          icon={FileText}
          description={`${leases?.expiring ?? 0} expiring soon`}
          href="/admin/leases"
        />
        <StatCard
          title="Open Maintenance"
          value={maintenance?.open ?? 0}
          icon={Wrench}
          description={`${maintenance?.urgent ?? 0} urgent`}
          href="/admin/maintenance"
        />
        <StatCard
          title="Applications"
          value={(applications?.submitted ?? 0) + (applications?.underReview ?? 0)}
          icon={ClipboardList}
          description={`${applications?.submitted ?? 0} pending review`}
          href="/admin/applications"
        />
        <StatCard
          title="Total Users"
          value={users?.total ?? 0}
          icon={Users}
          description={`${users?.tenants ?? 0} tenants`}
          href="/admin/users"
        />
      </div>

      {/* Needs Attention */}
      {(maintenance.urgent > 0 || leases.expiring > 0 || applications.submitted > 0 || pendingCount > 0) && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <h2 className="text-lg font-semibold text-orange-800">Needs Attention</h2>
          <ul className="mt-3 space-y-2">
            {pendingCount > 0 && (
              <li className="flex items-center gap-2 text-sm text-orange-700">
                <UserCheck className="h-4 w-4" />
                <Link href="/admin/users?status=PENDING" className="underline">
                  {pendingCount} user(s) pending approval
                </Link>
              </li>
            )}
            {maintenance.urgent > 0 && (
              <li className="flex items-center gap-2 text-sm text-orange-700">
                <Wrench className="h-4 w-4" />
                <Link href="/admin/maintenance?priority=URGENT" className="underline">
                  {maintenance.urgent} urgent maintenance request(s)
                </Link>
              </li>
            )}
            {leases.expiring > 0 && (
              <li className="flex items-center gap-2 text-sm text-orange-700">
                <FileText className="h-4 w-4" />
                <Link href="/admin/leases?status=ACTIVE" className="underline">
                  {leases.expiring} lease(s) expiring within 30 days
                </Link>
              </li>
            )}
            {applications.submitted > 0 && (
              <li className="flex items-center gap-2 text-sm text-orange-700">
                <ClipboardList className="h-4 w-4" />
                <Link href="/admin/applications?status=SUBMITTED" className="underline">
                  {applications.submitted} pending application(s)
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
          {unreadNotifications > 0 && (
            <Link href="/admin/notifications" className="text-sm text-blue-600 hover:text-blue-800">
              {unreadNotifications} unread
            </Link>
          )}
        </div>
        <div className="mt-4 space-y-3">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification: { id: string; title: string; message: string; read: boolean; createdAt: string }) => (
              <div key={notification.id} className={`flex items-center justify-between border-b pb-3 last:border-0 ${!notification.read ? 'bg-blue-50/30 -mx-2 px-2 rounded' : ''}`}>
                <div className="flex items-center gap-3">
                  <Bell className={`h-4 w-4 ${!notification.read ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">{notification.message}</p>
                  </div>
                </div>
                <p className="flex-shrink-0 text-xs text-gray-400">{formatDateTime(notification.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent notifications</p>
          )}
          <Link href="/admin/notifications" className="block text-center text-sm text-blue-600 hover:text-blue-800">
            View all notifications
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div className="mt-4 space-y-3">
          {recentActivity?.length > 0 ? (
            recentActivity.map((event: { id: string; action: string; entityType: string; createdAt: string; user: { name: string | null } }) => (
              <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.user?.name ?? 'System'}{' '}
                    <span className="text-gray-500">{event.action.replace('.', ' ')}</span>
                  </p>
                  <p className="text-xs text-gray-400">{event.entityType}</p>
                </div>
                <p className="text-xs text-gray-400">{formatDateTime(event.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link
          href="/admin/properties"
          className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-sm font-medium">Manage Properties</span>
        </Link>
        <Link
          href="/admin/maintenance"
          className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <Wrench className="h-8 w-8 text-orange-600" />
          <span className="text-sm font-medium">Maintenance</span>
        </Link>
        <Link
          href="/admin/messages"
          className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="h-8 w-8 text-indigo-600" />
          <span className="text-sm font-medium">Messages</span>
        </Link>
        <Link
          href="/admin/users"
          className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <Users className="h-8 w-8 text-purple-600" />
          <span className="text-sm font-medium">Users</span>
        </Link>
      </div>
    </div>
  )
}
