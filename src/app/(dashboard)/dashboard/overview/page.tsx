'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { FileText, Wrench, Bell, Building2, ArrowRight, DollarSign, AlertTriangle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor, getRoleLabel } from '@/lib/auth-utils'
import { fetchApi } from '@/lib/api-client'

function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
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

function TenantDashboard() {
  const { data: leases, isLoading: leasesLoading } = useQuery({
    queryKey: ['my-leases'],
    queryFn: () => fetchApi('/api/leases'),
  })
  const { data: maintenance, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['my-maintenance'],
    queryFn: () => fetchApi('/api/maintenance'),
  })
  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['my-announcements'],
    queryFn: () => fetchApi('/api/announcements'),
  })
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['my-payments-overview'],
    queryFn: () => fetchApi('/api/tenant/payments?pageSize=1'),
  })

  const isLoading = leasesLoading || maintenanceLoading || announcementsLoading || paymentsLoading
  const activeLease = leases?.items?.find((l: Record<string, unknown>) => l.status === 'ACTIVE')
  const openRequests = maintenance?.items?.filter((r: Record<string, unknown>) => r.status === 'OPEN' || r.status === 'IN_PROGRESS') ?? []
  const paymentStats = payments?.stats ?? { totalDue: 0, totalPaid: 0, nextPayment: null }
  const hasOverdue = (payments?.items ?? []).some((p: Record<string, unknown>) => p.status === 'PENDING' && !p.paidAt && new Date(p.dueDate as string) < new Date())

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Current Lease */}
      <section>
        <SectionHeader title="Your Lease" action={activeLease ? { label: 'View Details', href: '/dashboard/lease' } : undefined} />
        <div className="mt-3 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {activeLease ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Unit</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">Unit {activeLease.unit?.number} - {activeLease.unit?.property?.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Monthly Rent</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatCurrency(activeLease.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Lease Period</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatDate(activeLease.startDate)} - {formatDate(activeLease.endDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(activeLease.status)}`}>{activeLease.status}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No active lease</p>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <SectionHeader title="Quick Access" />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <Link href="/dashboard/payments" className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Upcoming Payment</h3>
            </div>
            {paymentStats.nextPayment ? (
              <>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(paymentStats.nextPayment.amount)}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">due {formatDate(paymentStats.nextPayment.dueDate)}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No upcoming payments</p>
            )}
            {hasOverdue && (
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Overdue payment
              </div>
            )}
          </Link>
          <Link href="/dashboard/maintenance" className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Maintenance</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{openRequests.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">open requests</p>
          </Link>
          <Link href="/dashboard/documents" className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Documents</h3>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">View your documents</p>
          </Link>
          <Link href="/dashboard/notices" className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notices</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{announcements?.items?.length ?? 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">announcements</p>
          </Link>
        </div>
      </section>

      {/* Recent Notices */}
      {announcements?.items?.length > 0 && (
        <section>
          <SectionHeader title="Recent Notices" action={{ label: 'View All', href: '/dashboard/notices' }} />
          <div className="mt-3 rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {announcements.items.slice(0, 3).map((ann: Record<string, unknown>) => (
                <div key={ann.id as string} className="px-6 py-4">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{ann.title as string}</p>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2 dark:text-slate-400">{ann.content as string}</p>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDate(ann.createdAt as string)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function OwnerDashboard() {
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: () => fetchApi('/api/properties'),
  })
  const { data: leases, isLoading: leasesLoading } = useQuery({
    queryKey: ['my-leases'],
    queryFn: () => fetchApi('/api/leases'),
  })

  const isLoading = propertiesLoading || leasesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <section>
        <SectionHeader title="Portfolio Overview" />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Properties</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{properties?.items?.length ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Active Leases</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{leases?.items?.filter((l: Record<string, unknown>) => l.status === 'ACTIVE')?.length ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Maintenance</h3>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">View via admin panel</p>
          </div>
        </div>
      </section>

      {/* Properties list */}
      {properties?.items?.length > 0 && (
        <section>
          <SectionHeader title="Your Properties" />
          <div className="mt-3 rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {properties.items.map((prop: Record<string, unknown>) => (
                <div key={prop.id as string} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{prop.name as string}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{prop.address as string}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(prop.status as string)}`}>{prop.status as string}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default function UserDashboardOverview() {
  const { data: session } = useSession()
  const role = session?.user?.role

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          Welcome back, {session?.user?.name ?? 'User'}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{getRoleLabel(role ?? 'TENANT')} Dashboard</p>
      </div>

      {role === 'TENANT' && <TenantDashboard />}
      {role === 'LANDLORD' && <OwnerDashboard />}
      {!role && <TenantDashboard />}
    </div>
  )
}
