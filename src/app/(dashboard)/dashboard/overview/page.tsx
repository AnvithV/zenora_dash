'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { FileText, Wrench, Bell, Building2 } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor, getRoleLabel } from '@/lib/auth-utils'
import { fetchApi } from '@/lib/api-client'

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

  const isLoading = leasesLoading || maintenanceLoading || announcementsLoading
  const activeLease = leases?.items?.find((l: Record<string, unknown>) => l.status === 'ACTIVE')
  const openRequests = maintenance?.items?.filter((r: Record<string, unknown>) => r.status === 'OPEN' || r.status === 'IN_PROGRESS') ?? []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Lease */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Your Lease</h2>
        {activeLease ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Unit</p><p className="font-medium">Unit {activeLease.unit?.number} - {activeLease.unit?.property?.name}</p></div>
            <div><p className="text-sm text-gray-500">Monthly Rent</p><p className="font-medium">{formatCurrency(activeLease.monthlyRent)}</p></div>
            <div><p className="text-sm text-gray-500">Lease Period</p><p className="font-medium">{formatDate(activeLease.startDate)} - {formatDate(activeLease.endDate)}</p></div>
            <div><p className="text-sm text-gray-500">Status</p><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(activeLease.status)}`}>{activeLease.status}</span></div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No active lease</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/dashboard/maintenance" className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-orange-600" /><h3 className="font-semibold">Maintenance</h3></div>
          <p className="mt-2 text-2xl font-bold">{openRequests.length}</p>
          <p className="text-sm text-gray-500">open requests</p>
        </Link>
        <Link href="/dashboard/documents" className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" /><h3 className="font-semibold">Documents</h3></div>
          <p className="mt-2 text-sm text-gray-500">View your documents</p>
        </Link>
        <Link href="/dashboard/notices" className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-purple-600" /><h3 className="font-semibold">Notices</h3></div>
          <p className="mt-2 text-2xl font-bold">{announcements?.items?.length ?? 0}</p>
          <p className="text-sm text-gray-500">announcements</p>
        </Link>
      </div>

      {/* Recent Notices */}
      {announcements?.items?.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent Notices</h2>
          <div className="mt-4 space-y-3">
            {announcements.items.slice(0, 3).map((ann: Record<string, unknown>) => (
              <div key={ann.id as string} className="border-b pb-3 last:border-0">
                <p className="font-medium">{ann.title as string}</p>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{ann.content as string}</p>
                <p className="mt-1 text-xs text-gray-400">{formatDate(ann.createdAt as string)}</p>
              </div>
            ))}
          </div>
        </div>
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
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" /><h3 className="font-semibold">Properties</h3></div>
          <p className="mt-2 text-2xl font-bold">{properties?.items?.length ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" /><h3 className="font-semibold">Active Leases</h3></div>
          <p className="mt-2 text-2xl font-bold">{leases?.items?.filter((l: Record<string, unknown>) => l.status === 'ACTIVE')?.length ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-orange-600" /><h3 className="font-semibold">Maintenance</h3></div>
          <p className="mt-2 text-sm text-gray-500">View via admin panel</p>
        </div>
      </div>

      {properties?.items?.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Your Properties</h2>
          <div className="mt-4 space-y-3">
            {properties.items.map((prop: Record<string, unknown>) => (
              <div key={prop.id as string} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div><p className="font-medium">{prop.name as string}</p><p className="text-sm text-gray-500">{prop.address as string}</p></div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(prop.status as string)}`}>{prop.status as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function UserDashboardOverview() {
  const { data: session } = useSession()
  const role = session?.user?.role

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session?.user?.name ?? 'User'}
        </h1>
        <p className="text-gray-500">{getRoleLabel(role ?? 'TENANT')} Dashboard</p>
      </div>

      {role === 'TENANT' && <TenantDashboard />}
      {role === 'LANDLORD' && <OwnerDashboard />}
      {!role && <TenantDashboard />}
    </div>
  )
}
