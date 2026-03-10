'use client'

import { useState } from 'react'
import { useUnit, useUpdateUnit } from '@/hooks/use-units'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function UnitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useUnit(id)
  const updateUnit = useUpdateUnit()

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    number: '',
    floor: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    rent: '',
    deposit: '',
    status: 'AVAILABLE',
  })

  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
  if (!data?.data) return <div className="rounded-lg border border-red-200 bg-red-50 p-6"><p className="text-red-700">Unit not found</p></div>

  const unit = data.data

  const handleEdit = () => {
    setEditForm({
      number: unit.number ?? '',
      floor: unit.floor != null ? String(unit.floor) : '',
      bedrooms: unit.bedrooms != null ? String(unit.bedrooms) : '',
      bathrooms: unit.bathrooms != null ? String(unit.bathrooms) : '',
      sqft: unit.sqft != null ? String(unit.sqft) : '',
      rent: unit.rent != null ? String(unit.rent) : '',
      deposit: unit.deposit != null ? String(unit.deposit) : '',
      status: unit.status ?? 'AVAILABLE',
    })
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUnit.mutate(
      {
        id,
        data: {
          number: editForm.number,
          floor: editForm.floor ? Number(editForm.floor) : undefined,
          bedrooms: Number(editForm.bedrooms),
          bathrooms: Number(editForm.bathrooms),
          sqft: editForm.sqft ? Number(editForm.sqft) : undefined,
          rent: Number(editForm.rent),
          deposit: editForm.deposit ? Number(editForm.deposit) : undefined,
          status: editForm.status,
        },
      },
      { onSuccess: () => setEditOpen(false) }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-md border p-2 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unit {unit.number}</h1>
          <p className="text-gray-500">{unit.property?.name} - {unit.property?.address}</p>
        </div>
        <button
          onClick={handleEdit}
          className="ml-auto inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(unit.status)}`}>
          {unit.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Unit Details</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Bedrooms</p><p className="font-medium">{unit.bedrooms}</p></div>
            <div><p className="text-sm text-gray-500">Bathrooms</p><p className="font-medium">{unit.bathrooms}</p></div>
            <div><p className="text-sm text-gray-500">Square Feet</p><p className="font-medium">{unit.sqft ?? '-'}</p></div>
            <div><p className="text-sm text-gray-500">Floor</p><p className="font-medium">{unit.floor ?? '-'}</p></div>
            <div><p className="text-sm text-gray-500">Monthly Rent</p><p className="font-medium">{formatCurrency(unit.rent)}</p></div>
            <div><p className="text-sm text-gray-500">Deposit</p><p className="font-medium">{unit.deposit ? formatCurrency(unit.deposit) : '-'}</p></div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Lease History</h2>
          <div className="mt-4 space-y-3">
            {unit.leases?.length > 0 ? (
              unit.leases.map((lease: Record<string, unknown>) => (
                <div key={lease.id as string} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{(lease.tenant as { name: string })?.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(lease.startDate as string)} - {formatDate(lease.endDate as string)}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(lease.status as string)}`}>
                    {lease.status as string}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No lease history</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>Update the unit details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Number</label>
                <input type="text" required value={editForm.number} onChange={e => setEditForm(f => ({ ...f, number: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Floor</label>
                <input type="number" value={editForm.floor} onChange={e => setEditForm(f => ({ ...f, floor: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input type="number" required value={editForm.bedrooms} onChange={e => setEditForm(f => ({ ...f, bedrooms: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input type="number" required value={editForm.bathrooms} onChange={e => setEditForm(f => ({ ...f, bathrooms: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Square Feet</label>
              <input type="number" value={editForm.sqft} onChange={e => setEditForm(f => ({ ...f, sqft: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
                <input type="number" required value={editForm.rent} onChange={e => setEditForm(f => ({ ...f, rent: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deposit</label>
                <input type="number" value={editForm.deposit} onChange={e => setEditForm(f => ({ ...f, deposit: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={updateUnit.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {updateUnit.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
