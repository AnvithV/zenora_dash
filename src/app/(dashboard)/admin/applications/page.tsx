'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Search, ClipboardList } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'

export default function ApplicationsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['applications', { search, status: statusFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      const res = await fetch(`/api/applications?${params}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data
    },
  })

  const applications = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Applications</h1><p className="text-gray-500">{total} total</p></div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Property / Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={4} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-gray-200" /></td></tr>))
            ) : applications.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center"><ClipboardList className="mx-auto h-12 w-12 text-gray-300" /><p className="mt-2 text-sm text-gray-500">No applications</p></td></tr>
            ) : (
              applications.map((app: Record<string, unknown>) => (
                <tr key={app.id as string} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/admin/applications/${app.id}`)}>
                  <td className="px-6 py-4"><div className="font-medium">{(app.applicant as { name: string })?.name}</div><div className="text-sm text-gray-500">{(app.applicant as { email: string })?.email}</div></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(app.property as { name: string })?.name} / Unit {(app.unit as { number: string })?.number}</td>
                  <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(app.status as string)}`}>{(app.status as string).replace('_', ' ')}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(app.createdAt as string)}</td>
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
