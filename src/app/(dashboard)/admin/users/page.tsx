'use client'

import { useState } from 'react'
import { useUsers, useUpdateUser } from '@/hooks/use-users'
import { useRouter } from 'next/navigation'
import { Search, Users, UserCheck, UserX, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { getRoleLabel } from '@/lib/auth-utils'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function UsersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useUsers({
    search,
    role: roleFilter === 'all' ? '' : roleFilter,
    status: statusFilter === 'all' ? '' : statusFilter,
    page,
    pageSize: 10,
  })
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

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'PLATFORM_ADMIN': return 'default'
      case 'LANDLORD': return 'secondary'
      default: return 'outline' as const
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Users"
        description={`${total} total user${total !== 1 ? 's' : ''} across all roles`}
      />

      {/* Pending Users Banner */}
      {pendingCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  {pendingCount} pending user{pendingCount !== 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-sm text-amber-700">
                  New registrations that need your approval.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 bg-white text-amber-800 hover:bg-amber-50"
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

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
            <SelectItem value="LANDLORD">Landlord</SelectItem>
            <SelectItem value="TENANT">Tenant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">No users found</p>
                  <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : (
              users.map((user: Record<string, unknown>) => (
                <tr
                  key={user.id as string}
                  className="cursor-pointer transition-colors hover:bg-violet-50/40"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.image as string} alt={(user.name as string) ?? ''} />
                        <AvatarFallback className="bg-violet-100 text-xs font-medium text-violet-700">
                          {getInitials((user.name as string) ?? (user.email as string) ?? '?')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{(user.name as string) ?? 'Unnamed'}</p>
                        <p className="text-sm text-slate-500">{user.email as string}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={roleBadgeVariant(user.role as string)}>
                      {getRoleLabel(user.role as string)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status as string} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(user.createdAt as string)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-green-700 hover:bg-green-50 hover:text-green-800"
                          onClick={(e) => handleApprove(user.id as string, e)}
                          disabled={updateUser.isPending}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={(e) => handleReject(user.id as string, e)}
                          disabled={updateUser.isPending}
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
