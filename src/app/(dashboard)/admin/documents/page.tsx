'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileBox, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['documents', { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', String(page))
      const res = await fetch(`/api/documents?${params}`)
      return res.json()
    },
  })

  const documents = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Documents</h1><p className="text-slate-500">{total} total</p></div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search documents..." className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Uploaded By</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-slate-200" /></td></tr>))
            ) : documents.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><FileBox className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-2 text-sm text-slate-500">No documents</p></td></tr>
            ) : (
              documents.map((doc: Record<string, unknown>) => (
                <tr key={doc.id as string} className="hover:bg-violet-50/30">
                  <td className="px-6 py-4 font-medium">{doc.name as string}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{(doc.type as string).replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{(doc.uploadedBy as { name: string })?.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(doc.createdAt as string)}</td>
                  <td className="px-6 py-4 text-right">
                    <a href={doc.url as string} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800"><Download className="inline h-4 w-4" /></a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
