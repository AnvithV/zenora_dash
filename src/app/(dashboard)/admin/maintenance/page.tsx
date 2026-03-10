'use client'

import { useState } from 'react'
import { useMaintenanceRequests } from '@/hooks/use-maintenance'
import { useRouter } from 'next/navigation'
import { Search, Wrench } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'

export default function MaintenancePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useMaintenanceRequests({ search, status: statusFilter, priority: priorityFilter, page, pageSize: 10 })

  const requests = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
        <p className="text-gray-500">{total} total requests</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search requests..." className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Request</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Property / Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Requester</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-gray-200" /></td></tr>
              ))
            ) : requests.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><Wrench className="mx-auto h-12 w-12 text-gray-300" /><p className="mt-2 text-sm text-gray-500">No maintenance requests</p></td></tr>
            ) : (
              requests.map((req: Record<string, unknown>) => (
                <tr key={req.id as string} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/admin/maintenance/${req.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{req.title as string}</div>
                    <div className="text-sm text-gray-500">{req.category as string}</div>
                  </td>
                  <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(req.status as string)}`}>{(req.status as string).replace('_', ' ')}</span></td>
                  <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(req.priority as string)}`}>{req.priority as string}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(req.property as { name: string })?.name} / Unit {(req.unit as { number: string })?.number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(req.requester as { name: string })?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(req.createdAt as string)}</td>
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
