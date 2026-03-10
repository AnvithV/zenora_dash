'use client'

import { useState } from 'react'
import { useMaintenanceRequests, useCreateMaintenanceRequest } from '@/hooks/use-maintenance'
import { useLeases } from '@/hooks/use-leases'
import { Wrench, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const initialForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  category: 'GENERAL',
  unitId: '',
  propertyId: '',
}

export default function UserMaintenancePage() {
  const [page] = useState(1)
  const { data, isLoading } = useMaintenanceRequests({ page, pageSize: 10 })
  const requests = data?.items ?? []
  const total = data?.total ?? 0

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const createMutation = useCreateMaintenanceRequest()
  const { data: leasesData } = useLeases({ status: 'ACTIVE' })
  const units = (leasesData?.items ?? []).map((lease: Record<string, unknown>) => {
    const unit = lease.unit as { id: string; number: string; property: { id: string; name: string } }
    return { id: unit.id, number: unit.number, propertyId: unit.property.id, property: unit.property }
  })

  const handleUnitChange = (unitId: string) => {
    const selectedUnit = units.find((u: Record<string, unknown>) => u.id === unitId)
    setForm(f => ({
      ...f,
      unitId,
      propertyId: selectedUnit?.propertyId as string ?? '',
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(
      {
        title: form.title,
        description: form.description,
        priority: form.priority,
        category: form.category,
        unitId: form.unitId,
        propertyId: form.propertyId,
      },
      { onSuccess: () => { setCreateOpen(false); setForm(initialForm) } }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Maintenance Requests</h1><p className="text-slate-500">{total} total</p></div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-200" />)
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No maintenance requests</p>
          </div>
        ) : (
          requests.map((req: Record<string, unknown>) => (
            <div key={req.id as string} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{req.title as string}</h3>
                  <p className="mt-1 text-sm text-slate-500">{req.category as string} - {(req.property as { name: string })?.name} / Unit {(req.unit as { number: string })?.number}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(req.priority as string)}`}>{req.priority as string}</span>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(req.status as string)}`}>{(req.status as string).replace('_', ' ')}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">{req.description as string}</p>
              <p className="mt-2 text-xs text-slate-400">Submitted {formatDate(req.createdAt as string)}</p>
            </div>
          ))
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
            <DialogDescription>Describe the issue and we will get it resolved.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Priority</label>
                <select required value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="APPLIANCE">Appliance</option>
                  <option value="STRUCTURAL">Structural</option>
                  <option value="PEST_CONTROL">Pest Control</option>
                  <option value="LANDSCAPING">Landscaping</option>
                  <option value="GENERAL">General</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit</label>
              <select required value={form.unitId} onChange={e => handleUnitChange(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="">Select a unit</option>
                {units.map((unit: Record<string, unknown>) => (
                  <option key={unit.id as string} value={unit.id as string}>
                    Unit {unit.number as string} - {(unit.property as { name: string })?.name ?? 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 disabled:opacity-50">
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
