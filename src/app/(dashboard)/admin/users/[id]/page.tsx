'use client'

import { useUser, useUpdateUser } from '@/hooks/use-users'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getStatusColor, getRoleLabel } from '@/lib/auth-utils'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useUser(id)
  const updateUser = useUpdateUser()

  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
  if (!data?.data) return <div className="rounded-lg border border-red-200 bg-red-50 p-6"><p className="text-red-700">User not found</p></div>

  const user = data.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-md border p-2 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name ?? 'Unnamed User'}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Profile</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{user.name ?? '-'}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{user.email}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{user.phone ?? '-'}</p></div>
              <div><p className="text-sm text-gray-500">Joined</p><p className="font-medium">{formatDate(user.createdAt)}</p></div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <select
                  className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={user.role}
                  onChange={(e) => updateUser.mutate({ id, data: { role: e.target.value } })}
                >
                  {['PLATFORM_ADMIN', 'LANDLORD', 'TENANT'].map(role => (
                    <option key={role} value={role}>{getRoleLabel(role)}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <select
                  className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={user.status}
                  onChange={(e) => updateUser.mutate({ id, data: { status: e.target.value } })}
                >
                  {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {user.leases?.length > 0 && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Leases</h2>
              <div className="mt-4 space-y-3">
                {user.leases.map((lease: Record<string, unknown>) => (
                  <div key={lease.id as string} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        Unit {(lease.unit as { number: string }).number} - {((lease.unit as { property: { name: string } }).property).name}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(lease.startDate as string)} - {formatDate(lease.endDate as string)}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(lease.status as string)}`}>{lease.status as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Stats</h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-500">Leases</span><span className="font-medium">{user._count?.leases ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Maintenance</span><span className="font-medium">{user._count?.maintenanceRequests ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Owned Properties</span><span className="font-medium">{user._count?.ownedProperties ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Managed Properties</span><span className="font-medium">{user._count?.managedProperties ?? 0}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
