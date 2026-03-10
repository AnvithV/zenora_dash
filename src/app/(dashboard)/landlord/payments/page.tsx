'use client'

import { useState } from 'react'
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment } from '@/hooks/use-payments'
import { useLandlordLeases } from '@/hooks/use-landlord-leases'
import { DollarSign, Plus, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'

const STATUSES = ['', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'] as const

export default function LandlordPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editPayment, setEditPayment] = useState<Record<string, unknown> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Create form
  const [createForm, setCreateForm] = useState({ leaseId: '', amount: '', dueDate: '', method: '' })

  const { data, isLoading } = usePayments({
    status: statusFilter || undefined,
    page,
    pageSize: 10,
  })
  const { data: leasesData } = useLandlordLeases()
  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()
  const deletePayment = useDeletePayment()

  const payments = data?.items ?? []
  const stats = data?.stats
  const totalPages = data?.totalPages ?? 1
  const leases = leasesData?.data ?? []

  const handleCreate = () => {
    if (!createForm.leaseId || !createForm.amount || !createForm.dueDate) return
    createPayment.mutate(
      {
        leaseId: createForm.leaseId,
        amount: parseFloat(createForm.amount),
        dueDate: createForm.dueDate,
        method: createForm.method || undefined,
      },
      {
        onSuccess: () => {
          setShowCreate(false)
          setCreateForm({ leaseId: '', amount: '', dueDate: '', method: '' })
          toast({ title: 'Payment created' })
        },
      },
    )
  }

  const handleMarkPaid = (id: string) => {
    updatePayment.mutate(
      { id, data: { status: 'COMPLETED' } },
      { onSuccess: () => toast({ title: 'Payment marked as completed' }) },
    )
  }

  const handleDelete = () => {
    if (!deleteId) return
    deletePayment.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        toast({ title: 'Payment deleted' })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500">Manage tenant payment records</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create Payment
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Collected" value={`$${stats.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} count={stats.totalCollectedCount} color="green" />
          <StatCard label="Pending" value={`$${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} count={stats.pendingCount} color="yellow" />
          <StatCard label="Overdue" value={`$${stats.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} count={stats.overdueCount} color="red" />
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4"><Skeleton className="h-12 w-full" /></div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12">
            <DollarSign className="h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Unit</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Paid At</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment: Record<string, unknown>) => {
                  const lease = payment.lease as Record<string, unknown>
                  const tenant = lease.tenant as Record<string, unknown>
                  const unit = lease.unit as Record<string, unknown>
                  const property = (unit.property as Record<string, unknown>)
                  const isOverdue = payment.status === 'PENDING' && new Date(payment.dueDate as string) < new Date()

                  return (
                    <tr key={payment.id as string} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{tenant.name as string}</p>
                        <p className="text-xs text-slate-500">{tenant.email as string}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">Unit {unit.number as string}</p>
                        <p className="text-xs text-slate-500">{property.name as string}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        ${(payment.amount as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 ${isOverdue ? 'font-medium text-red-600' : 'text-slate-700'}`}>
                        {formatDate(payment.dueDate as string)}
                        {isOverdue && <span className="ml-1 text-xs">(overdue)</span>}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={payment.status as string} />
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {payment.paidAt ? formatDate(payment.paidAt as string) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {payment.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkPaid(payment.id as string)}
                              disabled={updatePayment.isPending}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditPayment(payment)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteId(payment.id as string)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Payment Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Lease *</Label>
              <Select value={createForm.leaseId} onValueChange={(v) => setCreateForm(f => ({ ...f, leaseId: v }))}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a lease..." />
                </SelectTrigger>
                <SelectContent>
                  {leases.map((lease: Record<string, unknown>) => {
                    const tenant = lease.tenant as Record<string, unknown>
                    const unit = lease.unit as Record<string, unknown>
                    const property = (unit.property as Record<string, unknown>)
                    return (
                      <SelectItem key={lease.id as string} value={lease.id as string}>
                        {tenant.name as string} — Unit {unit.number as string}, {property.name as string}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount *</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={createForm.amount} onChange={(e) => setCreateForm(f => ({ ...f, amount: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input type="date" value={createForm.dueDate} onChange={(e) => setCreateForm(f => ({ ...f, dueDate: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Method</Label>
              <Input placeholder="e.g. Bank Transfer, Card" value={createForm.method} onChange={(e) => setCreateForm(f => ({ ...f, method: e.target.value }))} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!createForm.leaseId || !createForm.amount || !createForm.dueDate || createPayment.isPending}>
              {createPayment.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={!!editPayment} onOpenChange={(open) => { if (!open) setEditPayment(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {editPayment && <EditPaymentForm payment={editPayment} onClose={() => setEditPayment(null)} updatePayment={updatePayment} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Payment"
        description="Are you sure you want to delete this payment? This cannot be undone."
        confirmLabel={deletePayment.isPending ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

function EditPaymentForm({
  payment,
  onClose,
  updatePayment,
}: {
  payment: Record<string, unknown>
  onClose: () => void
  updatePayment: ReturnType<typeof useUpdatePayment>
}) {
  const [status, setStatus] = useState(payment.status as string)
  const [amount, setAmount] = useState(String(payment.amount))
  const [dueDate, setDueDate] = useState((payment.dueDate as string).slice(0, 10))
  const [method, setMethod] = useState((payment.method as string) ?? '')

  const handleSave = () => {
    const changes: Record<string, unknown> = {}
    if (status !== payment.status) changes.status = status
    if (parseFloat(amount) !== payment.amount) changes.amount = parseFloat(amount)
    if (dueDate !== (payment.dueDate as string).slice(0, 10)) changes.dueDate = dueDate
    if (method !== ((payment.method as string) ?? '')) changes.method = method

    if (Object.keys(changes).length === 0) { onClose(); return }

    updatePayment.mutate(
      { id: payment.id as string, data: changes },
      {
        onSuccess: () => {
          onClose()
          toast({ title: 'Payment updated' })
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'].map(s => (
              <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Amount</Label>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label>Due Date</Label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label>Method</Label>
        <Input value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1.5" />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={updatePayment.isPending}>
          {updatePayment.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </div>
  )
}

function StatCard({ label, value, count, color }: { label: string; value: string; count: number; color: string }) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }
  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70">{count} payment{count !== 1 ? 's' : ''}</p>
    </div>
  )
}
