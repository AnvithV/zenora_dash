'use client'

import { useState } from 'react'
import { useLeases } from '@/hooks/use-leases'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'

function LeaseTerms({ terms }: { terms: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      >
        <span>Lease Terms</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap dark:text-slate-400">{terms}</p>
      )}
    </div>
  )
}

export default function UserLeasePage() {
  const { data, isLoading } = useLeases({})
  const leases = data?.items ?? []

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Leases</h1></div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      ) : leases.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No leases</p>
        </div>
      ) : (
        leases.map((lease: Record<string, unknown>) => (
          <div key={lease.id as string} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Unit {(lease.unit as { number: string })?.number}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{((lease.unit as { property: { name: string } })?.property)?.name}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(lease.status as string)}`}>{lease.status as string}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Monthly Rent</p><p className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(lease.monthlyRent as number)}</p></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Security Deposit</p><p className="font-medium text-slate-900 dark:text-slate-100">{lease.securityDeposit ? formatCurrency(lease.securityDeposit as number) : '-'}</p></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Start Date</p><p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(lease.startDate as string)}</p></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400">End Date</p><p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(lease.endDate as string)}</p></div>
            </div>
            {typeof lease.terms === 'string' && lease.terms && <LeaseTerms terms={lease.terms} />}
          </div>
        ))
      )}
    </div>
  )
}
