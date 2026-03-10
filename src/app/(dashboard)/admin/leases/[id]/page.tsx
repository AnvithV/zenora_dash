'use client'

import { useState } from 'react'
import { useLease, useUpdateLease } from '@/hooks/use-leases'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function LeaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useLease(id)
  const updateLease = useUpdateLease()

  const [showRenewDialog, setShowRenewDialog] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [newEndDate, setNewEndDate] = useState('')
  const [newRent, setNewRent] = useState('')

  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
  if (!data?.data) return <div className="rounded-lg border border-red-200 bg-red-50 p-6"><p className="text-red-700">Lease not found</p></div>

  const lease = data.data

  const handleRenew = () => {
    updateLease.mutate(
      { id, data: { action: 'renew', newEndDate, newRent: Number(newRent) } },
      {
        onSuccess: () => {
          setShowRenewDialog(false)
          setNewEndDate('')
          setNewRent('')
        },
      }
    )
  }

  const handleTerminate = () => {
    updateLease.mutate(
      { id, data: { action: 'terminate' } },
      { onSuccess: () => setShowTerminateDialog(false) }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-md border p-2 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Lease - Unit {lease.unit?.number}
          </h1>
          <p className="text-gray-500">{lease.unit?.property?.name}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(lease.status)}`}>
          {lease.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Lease Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{formatDate(lease.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">{formatDate(lease.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="font-medium">{formatCurrency(lease.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Security Deposit</p>
                <p className="font-medium">{formatCurrency(lease.securityDeposit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <select
                  className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={lease.status}
                  onChange={(e) => updateLease.mutate({ id, data: { status: e.target.value } })}
                >
                  {['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {lease.terms && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Terms</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{lease.terms}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Tenant</h3>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{lease.tenant?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{lease.tenant?.email ?? '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Property</h3>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-medium">{lease.unit?.property?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">{lease.unit?.number ?? '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Actions</h3>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setShowRenewDialog(true)}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Renew Lease
              </button>
              <button
                onClick={() => setShowTerminateDialog(true)}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Terminate Lease
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Renew Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Lease</DialogTitle>
            <DialogDescription>Enter the new lease end date and monthly rent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New End Date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Monthly Rent</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={newRent}
                onChange={(e) => setNewRent(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowRenewDialog(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRenew}
              disabled={!newEndDate || !newRent || updateLease.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateLease.isPending ? 'Renewing...' : 'Renew'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Lease</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this lease? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowTerminateDialog(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleTerminate}
              disabled={updateLease.isPending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {updateLease.isPending ? 'Terminating...' : 'Terminate'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
