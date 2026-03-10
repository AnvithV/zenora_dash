'use client'

import { useState } from 'react'
import { useProperty, useUpdateProperty } from '@/hooks/use-properties'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, Wrench, FileText, Pencil } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, error } = useProperty(id)
  const updateProperty = useUpdateProperty()

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'RESIDENTIAL',
    status: 'ACTIVE',
    yearBuilt: '',
    description: '',
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-700">Property not found</p>
        <Link href="/admin/properties" className="mt-2 text-sm text-red-600 underline">
          Back to properties
        </Link>
      </div>
    )
  }

  const property = data.data

  const handleEdit = () => {
    setEditForm({
      name: property.name ?? '',
      address: property.address ?? '',
      city: property.city ?? '',
      state: property.state ?? '',
      zipCode: property.zipCode ?? '',
      type: property.type ?? 'RESIDENTIAL',
      status: property.status ?? 'ACTIVE',
      yearBuilt: property.yearBuilt ? String(property.yearBuilt) : '',
      description: property.description ?? '',
    })
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProperty.mutate(
      {
        id,
        data: {
          ...editForm,
          yearBuilt: editForm.yearBuilt ? Number(editForm.yearBuilt) : undefined,
          description: editForm.description || undefined,
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
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          <p className="text-gray-500">{property.address}, {property.city}, {property.state} {property.zipCode}</p>
        </div>
        <button
          onClick={handleEdit}
          className="ml-auto inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(property.status)}`}>
          {property.status}
        </span>
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Property Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{property.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year Built</p>
                <p className="font-medium">{property.yearBuilt ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium">{property.owner?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p className="font-medium">{property.manager?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="font-medium">{property._count?.units ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(property.createdAt)}</p>
              </div>
            </div>
            {property.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1 text-gray-700">{property.description}</p>
              </div>
            )}
          </div>

          {/* Units List */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Units ({property.units?.length ?? 0})</h2>
            </div>
            <div className="mt-4">
              {property.units?.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 text-left text-xs font-medium uppercase text-gray-500">Unit</th>
                      <th className="py-2 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                      <th className="py-2 text-left text-xs font-medium uppercase text-gray-500">Bed/Bath</th>
                      <th className="py-2 text-left text-xs font-medium uppercase text-gray-500">Rent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {property.units.map((unit: Record<string, unknown>) => (
                      <tr
                        key={unit.id as string}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/admin/units/${unit.id}`)}
                      >
                        <td className="py-3 font-medium">Unit {unit.number as string}</td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(unit.status as string)}`}>
                            {unit.status as string}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-500">
                          {unit.bedrooms as number}bd / {unit.bathrooms as number}ba
                        </td>
                        <td className="py-3 text-sm">{formatCurrency(unit.rent as number)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No units added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Units</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">{property._count?.units ?? 0}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold">Maintenance</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">{property._count?.maintenance ?? 0}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Documents</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">{property._count?.documents ?? 0}</p>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>Update the property details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" required value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" required value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input type="text" required value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input type="text" required value={editForm.zipCode} onChange={e => setEditForm(f => ({ ...f, zipCode: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="MIXED_USE">Mixed Use</option>
                  <option value="INDUSTRIAL">Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year Built</label>
              <input type="number" value={editForm.yearBuilt} onChange={e => setEditForm(f => ({ ...f, yearBuilt: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={updateProperty.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {updateProperty.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
