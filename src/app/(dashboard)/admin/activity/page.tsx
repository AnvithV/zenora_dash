'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Search } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function ActivityPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['activity', { search, page, entityType }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('action', search)
      if (entityType) params.set('entityType', entityType)
      params.set('page', String(page))
      params.set('pageSize', '20')
      const res = await fetch(`/api/admin/activity?${params.toString()}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      return json
    },
  })

  const events = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Activity Log</h1><p className="text-gray-500">{total} total events</p></div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1) }}
        >
          <option value="">All Types</option>
          <option value="PROPERTY">Property</option>
          <option value="UNIT">Unit</option>
          <option value="LEASE">Lease</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="DOCUMENT">Document</option>
          <option value="USER">User</option>
          <option value="PAYMENT">Payment</option>
        </select>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (<div key={i} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-gray-200" /></div>))
          ) : events.length === 0 ? (
            <div className="px-6 py-12 text-center"><Activity className="mx-auto h-12 w-12 text-gray-300" /><p className="mt-2 text-sm text-gray-500">No activity</p></div>
          ) : (
            events.map((event: Record<string, unknown>) => (
              <div key={event.id as string} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium">
                    <span className="text-gray-900">{(event.user as { name: string })?.name ?? 'System'}</span>
                    <span className="text-gray-500"> {(event.action as string).replace('.', ' ')}</span>
                  </p>
                  <p className="text-xs text-gray-400">{event.entityType as string} #{(event.entityId as string).slice(0, 8)}</p>
                </div>
                <p className="text-xs text-gray-400">{formatDateTime(event.createdAt as string)}</p>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
