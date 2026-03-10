'use client'

import { useState } from 'react'
import { useUsers, useUpdateUser } from '@/hooks/use-users'
import { useRouter } from 'next/navigation'
import { Search, Users, UserCheck, UserX, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getStatusColor, getRoleLabel } from '@/lib/auth-utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function UsersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useUsers({ search, role: roleFilter, status: statusFilter, page, pageSize: 10 })
  const { data: pendingData } = useUsers({ status: 'PENDING', pageSize: 1 })
  const updateUser = useUpdateUser()

  const users = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const pendingCount = pendingData?.total ?? 0

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateUser.mutate({ id, data: { status: 'ACTIVE' } })
  }

  const handleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateUser.mutate({ id, data: { status: 'SUSPENDED' } })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500">{total} total users</p>
      </div>

      {/* Pending Users Banner */}
      {pendingCount > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">
                  {pendingCount} pending user{pendingCount !== 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-sm text-yellow-700">
                  These users have registered and are waiting for approval.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              onClick={() => {
                setStatusFilter('PENDING')
                setPage(1)
              }}
            >
              Review Pending
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}>
          <option value="">All Roles</option>
          <option value="PLATFORM_ADMIN">Platform Admin</option>
          <option value="LANDLORD">Landlord</option>
          <option value="TENANT">Tenant</option>
        </select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-gray-200" /></td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><Users className="mx-auto h-12 w-12 text-gray-300" /><p className="mt-2 text-sm text-gray-500">No users found</p></td></tr>
            ) : (
              users.map((user: Record<string, unknown>) => (
                <tr key={user.id as string} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/admin/users/${user.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{(user.name as string) ?? 'Unnamed'}</div>
                    <div className="text-sm text-gray-500">{user.email as string}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{getRoleLabel(user.role as string)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.status as string)}`}>{user.status as string}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt as string)}</td>
                  <td className="px-6 py-4 text-right">
                    {user.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleApprove(user.id as string, e)}
                          disabled={updateUser.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                          aria-label="Approve user"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={(e) => handleReject(user.id as string, e)}
                          disabled={updateUser.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                          aria-label="Reject user"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
