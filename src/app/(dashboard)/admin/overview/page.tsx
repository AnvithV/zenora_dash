'use client'

import { useAdminOverview } from '@/hooks/use-admin-overview'
import { useUsers } from '@/hooks/use-users'
import { useConversations } from '@/hooks/use-messages'
import { useNotifications } from '@/hooks/use-notifications'
import { Building2, Home, FileText, Wrench, Users, ClipboardList, MessageSquare, Bell, UserCheck, ArrowRight, AlertTriangle, Activity } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

function StatCard({ title, value, icon: Icon, description, href, highlight, iconColor }: {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  href?: string
  highlight?: boolean
  iconColor?: string
}) {
  const content = (
    <div className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${highlight ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-900/10' : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${highlight ? 'bg-amber-100 dark:bg-amber-900/30' : iconColor || 'bg-violet-50 dark:bg-violet-900/20'}`}>
          <Icon className={`h-5 w-5 ${highlight ? 'text-amber-600 dark:text-amber-400' : iconColor ? '' : 'text-violet-600 dark:text-violet-400'}`} />
        </div>
      </div>
    </div>
  )

  return href ? <Link href={href} className="block">{content}</Link> : content
}

function SectionHeader({ title, icon: Icon, action }: { title: string; icon?: React.ElementType; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />}
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1 text-sm text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
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
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800/50 dark:bg-red-900/10">
        <p className="text-red-700 dark:text-red-400">Failed to load dashboard data: {error.message}</p>
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Dashboard Overview</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Welcome to ZenPortal admin dashboard</p>
      </div>

      {/* Needs Attention - Alerts */}
      {(maintenance.urgent > 0 || leases.expiring > 0 || applications.submitted > 0 || pendingCount > 0) && (
        <section className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-800/40 dark:from-amber-900/10 dark:to-orange-900/10">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Needs Attention</h2>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {pendingCount > 0 && (
              <Link href="/admin/users?status=PENDING" className="flex items-center gap-2.5 rounded-lg bg-white/60 px-3 py-2.5 text-sm text-amber-800 transition-colors hover:bg-white/80 dark:bg-slate-900/40 dark:text-amber-300 dark:hover:bg-slate-900/60">
                <UserCheck className="h-4 w-4 shrink-0" />
                <span>{pendingCount} user(s) pending approval</span>
              </Link>
            )}
            {maintenance.urgent > 0 && (
              <Link href="/admin/maintenance?priority=URGENT" className="flex items-center gap-2.5 rounded-lg bg-white/60 px-3 py-2.5 text-sm text-amber-800 transition-colors hover:bg-white/80 dark:bg-slate-900/40 dark:text-amber-300 dark:hover:bg-slate-900/60">
                <Wrench className="h-4 w-4 shrink-0" />
                <span>{maintenance.urgent} urgent maintenance request(s)</span>
              </Link>
            )}
            {leases.expiring > 0 && (
              <Link href="/admin/leases?status=ACTIVE" className="flex items-center gap-2.5 rounded-lg bg-white/60 px-3 py-2.5 text-sm text-amber-800 transition-colors hover:bg-white/80 dark:bg-slate-900/40 dark:text-amber-300 dark:hover:bg-slate-900/60">
                <FileText className="h-4 w-4 shrink-0" />
                <span>{leases.expiring} lease(s) expiring within 30 days</span>
              </Link>
            )}
            {applications.submitted > 0 && (
              <Link href="/admin/applications?status=SUBMITTED" className="flex items-center gap-2.5 rounded-lg bg-white/60 px-3 py-2.5 text-sm text-amber-800 transition-colors hover:bg-white/80 dark:bg-slate-900/40 dark:text-amber-300 dark:hover:bg-slate-900/60">
                <ClipboardList className="h-4 w-4 shrink-0" />
                <span>{applications.submitted} pending application(s)</span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Action Items (conditional alerts) */}
      {(pendingCount > 0 || unreadMessages > 0) && (
        <section>
          <SectionHeader title="Action Items" />
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                iconColor="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              />
            )}
          </div>
        </section>
      )}

      {/* Property & Units Stats */}
      <section>
        <SectionHeader title="Properties & Units" icon={Building2} />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Properties"
            value={properties?.total ?? 0}
            icon={Building2}
            description={`${properties?.active ?? 0} active`}
            href="/admin/properties"
            iconColor="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Units"
            value={units?.total ?? 0}
            icon={Home}
            description={`${units?.occupancyRate ?? 0}% occupancy`}
            href="/admin/units"
            iconColor="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            title="Total Users"
            value={users?.total ?? 0}
            icon={Users}
            description={`${users?.tenants ?? 0} tenants`}
            href="/admin/users"
            iconColor="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
          />
        </div>
      </section>

      {/* Leases & Operations */}
      <section>
        <SectionHeader title="Leases & Operations" icon={FileText} />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Active Leases"
            value={leases?.active ?? 0}
            icon={FileText}
            description={`${leases?.expiring ?? 0} expiring soon`}
            href="/admin/leases"
            iconColor="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          />
          <StatCard
            title="Open Maintenance"
            value={maintenance?.open ?? 0}
            icon={Wrench}
            description={`${maintenance?.urgent ?? 0} urgent`}
            href="/admin/maintenance"
            iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            title="Applications"
            value={(applications?.submitted ?? 0) + (applications?.underReview ?? 0)}
            icon={ClipboardList}
            description={`${applications?.submitted ?? 0} pending review`}
            href="/admin/applications"
            iconColor="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
          />
        </div>
      </section>

      {/* Bottom Grid: Notifications & Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Notifications */}
        <section>
          <SectionHeader
            title="Recent Notifications"
            icon={Bell}
            action={unreadNotifications > 0 ? { label: `${unreadNotifications} unread`, href: '/admin/notifications' } : { label: 'View All', href: '/admin/notifications' }}
          />
          <div className="mt-3 rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentNotifications.map((notification: { id: string; title: string; message: string; read: boolean; createdAt: string }) => (
                  <div key={notification.id} className={`flex items-start gap-3 px-5 py-3.5 ${!notification.read ? 'bg-violet-50/40 dark:bg-violet-900/5' : ''}`}>
                    <Bell className={`mt-0.5 h-4 w-4 shrink-0 ${!notification.read ? 'text-violet-500 dark:text-violet-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 dark:text-slate-400">{notification.message}</p>
                    </div>
                    <p className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(notification.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No recent notifications</div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <SectionHeader title="Recent Activity" icon={Activity} />
          <div className="mt-3 rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {recentActivity?.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.map((event: { id: string; action: string; entityType: string; createdAt: string; user: { name: string | null } }) => (
                  <div key={event.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        <span className="font-medium">{event.user?.name ?? 'System'}</span>{' '}
                        <span className="text-slate-500 dark:text-slate-400">{event.action.replace('.', ' ')}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{event.entityType}</p>
                    </div>
                    <p className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(event.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No recent activity</div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section>
        <SectionHeader title="Quick Actions" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/admin/properties"
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-5 text-center transition-all hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-900/30">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Manage Properties</span>
          </Link>
          <Link
            href="/admin/maintenance"
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-5 text-center transition-all hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:group-hover:bg-amber-900/30">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Maintenance</span>
          </Link>
          <Link
            href="/admin/messages"
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-5 text-center transition-all hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:group-hover:bg-indigo-900/30">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Messages</span>
          </Link>
          <Link
            href="/admin/users"
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-5 text-center transition-all hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:group-hover:bg-violet-900/30">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Users</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
