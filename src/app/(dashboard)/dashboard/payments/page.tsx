'use client'

import { useState } from 'react'
import { DollarSign, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTenantPayments, useMarkPaymentPaid } from '@/hooks/use-tenant-payments'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'

function getPaymentDisplayStatus(payment: Record<string, unknown>): { label: string; color: string } {
  const status = payment.status as string
  const paidAt = payment.paidAt as string | null
  const dueDate = new Date(payment.dueDate as string)

  if (status === 'PENDING' && !paidAt) {
    if (dueDate < new Date()) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' }
    }
    return { label: 'Unpaid', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' }
  }
  if (status === 'PENDING' && paidAt) {
    return { label: 'Awaiting Verification', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' }
  }
  if (status === 'COMPLETED') {
    return { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' }
  }
  if (status === 'FAILED') {
    return { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' }
  }
  // REFUNDED, CANCELLED - show as-is
  return { label: status.charAt(0) + status.slice(1).toLowerCase(), color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' }
}

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Refunded', value: 'REFUNDED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function TenantPaymentsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = useTenantPayments({ page, pageSize: 10, status: statusFilter })
  const markPaid = useMarkPaymentPaid()

  const payments = data?.items ?? []
  const stats = data?.stats ?? { totalDue: 0, totalPaid: 0, nextPayment: null }
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Payments</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage your rent payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Next Payment</h3>
          </div>
          {stats.nextPayment ? (
            <>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(stats.nextPayment.amount)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Due {formatDate(stats.nextPayment.dueDate)}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No upcoming payments</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Due</h3>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(stats.totalDue)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">unpaid balance</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Paid</h3>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(stats.totalPaid)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">all time</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Payment Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <DollarSign className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No payments found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Paid At</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Property / Unit</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((payment: Record<string, unknown>) => {
                const displayStatus = getPaymentDisplayStatus(payment)
                const lease = payment.lease as { unit?: { number: string; property?: { name: string } } }
                const canMarkPaid = payment.status === 'PENDING' && !payment.paidAt

                return (
                  <tr key={payment.id as string} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{formatCurrency(payment.amount as number)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(payment.dueDate as string)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${displayStatus.color}`}>
                        {displayStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{payment.paidAt ? formatDate(payment.paidAt as string) : '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {lease?.unit?.property?.name} / Unit {lease?.unit?.number}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canMarkPaid && (
                        <button
                          onClick={() => markPaid.mutate(payment.id as string)}
                          disabled={markPaid.isPending}
                          className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
