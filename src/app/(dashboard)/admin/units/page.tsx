'use client'

import { useState } from 'react'
import { useUnits, useDeleteUnit, useCreateUnit } from '@/hooks/use-units'
import { useProperties } from '@/hooks/use-properties'
import { useRouter } from 'next/navigation'
import { Plus, Search, Home } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const initialForm = {
  number: '',
  propertyId: '',
  floor: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  rent: '',
  deposit: '',
  status: 'AVAILABLE',
}

export default function UnitsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const { data, isLoading } = useUnits({ search, status: statusFilter, page, pageSize: 10 })
  const deleteUnit = useDeleteUnit()
  const createMutation = useCreateUnit()
  const { data: propertiesData } = useProperties({ pageSize: 100 })

  const units = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(
      {
        number: form.number,
        propertyId: form.propertyId,
        floor: form.floor ? Number(form.floor) : undefined,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        sqft: form.sqft ? Number(form.sqft) : undefined,
        rent: Number(form.rent),
        deposit: form.deposit ? Number(form.deposit) : undefined,
        status: form.status,
      },
      { onSuccess: () => { setCreateOpen(false); setForm(initialForm) } }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Units</h1>
          <p className="text-slate-500">{total} total units</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search units..."
            className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RESERVED">Reserved</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Bed/Bath</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Rent</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-slate-200" /></td>
                </tr>
              ))
            ) : units.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Home className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No units found</p>
                </td>
              </tr>
            ) : (
              units.map((unit: Record<string, unknown>) => (
                <tr
                  key={unit.id as string}
                  className="cursor-pointer hover:bg-violet-50/30"
                  onClick={() => router.push(`/admin/units/${unit.id}`)}
                >
                  <td className="px-6 py-4 font-medium">Unit {unit.number as string}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {(unit.property as { name: string })?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(unit.status as string)}`}>
                      {unit.status as string}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {unit.bedrooms as number}bd / {unit.bathrooms as number}ba
                  </td>
                  <td className="px-6 py-4 text-sm">{formatCurrency(unit.rent as number)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this unit?')) deleteUnit.mutate(unit.id as string) }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Unit</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit Number</label>
              <input type="text" required value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Property</label>
              <select required value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="">Select property...</option>
                {(propertiesData?.items ?? []).map((p: Record<string, unknown>) => (
                  <option key={p.id as string} value={p.id as string}>{p.name as string}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Floor</label>
                <input type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Bedrooms</label>
                <input type="number" required value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Bathrooms</label>
                <input type="number" required value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Sq Ft</label>
                <input type="number" value={form.sqft} onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Rent</label>
                <input type="number" required value={form.rent} onChange={e => setForm(f => ({ ...f, rent: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Deposit</label>
                <input type="number" value={form.deposit} onChange={e => setForm(f => ({ ...f, deposit: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RESERVED">Reserved</option>
              </select>
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
