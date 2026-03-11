'use client'

import { useState } from 'react'
import { useLeases, useCreateLease } from '@/hooks/use-leases'
import { useUnits } from '@/hooks/use-units'
import { useUsers } from '@/hooks/use-users'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileText } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const initialForm = {
  unitId: '',
  tenantId: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  securityDeposit: '',
  status: 'DRAFT',
  terms: '',
}

export default function LeasesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const { data, isLoading } = useLeases({ search, status: statusFilter, page, pageSize: 10 })
  const createMutation = useCreateLease()
  const { data: unitsData } = useUnits({ pageSize: 100 })
  const { data: usersData } = useUsers({ role: 'TENANT', pageSize: 100 })

  const leases = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(
      {
        unitId: form.unitId,
        tenantId: form.tenantId,
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : undefined,
        status: form.status,
        terms: form.terms || undefined,
      },
      { onSuccess: () => { setCreateOpen(false); setForm(initialForm) } }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leases</h1>
          <p className="text-slate-500">{total} total leases</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" /> New Lease
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search leases..." className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="TERMINATED">Terminated</option>
          <option value="RENEWED">Renewed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Rent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-slate-200" /></td></tr>
              ))
            ) : leases.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><FileText className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-2 text-sm text-slate-500">No leases found</p></td></tr>
            ) : (
              leases.map((lease: Record<string, unknown>) => (
                <tr key={lease.id as string} className="cursor-pointer hover:bg-violet-50/30" onClick={() => router.push(`/admin/leases/${lease.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{(lease.tenant as { name: string })?.name}</div>
                    <div className="text-sm text-slate-500">{(lease.tenant as { email: string })?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    Unit {(lease.unit as { number: string })?.number} - {((lease.unit as { property: { name: string } })?.property)?.name}
                  </td>
                  <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(lease.status as string)}`}>{lease.status as string}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(lease.startDate as string)} - {formatDate(lease.endDate as string)}</td>
                  <td className="px-6 py-4 text-sm">{formatCurrency(lease.monthlyRent as number)}/mo</td>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Lease</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit</label>
              <select required value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="">Select unit...</option>
                {(unitsData?.items ?? []).map((u: Record<string, unknown>) => (
                  <option key={u.id as string} value={u.id as string}>Unit {u.number as string} - {(u.property as { name: string })?.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tenant</label>
              <select required value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="">Select tenant...</option>
                {(usersData?.items ?? []).map((u: Record<string, unknown>) => (
                  <option key={u.id as string} value={u.id as string}>{u.name as string} ({u.email as string})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Start Date</label>
                <input type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">End Date</label>
                <input type="date" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Monthly Rent</label>
                <input type="number" required value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Security Deposit</label>
                <input type="number" value={form.securityDeposit} onChange={e => setForm(f => ({ ...f, securityDeposit: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Terms</label>
              <textarea value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} rows={3} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 disabled:opacity-50">
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
