'use client'

import { useLeases } from '@/hooks/use-leases'
import { FileText } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'

export default function UserLeasePage() {
  const { data, isLoading } = useLeases({})
  const leases = data?.items ?? []

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">My Leases</h1></div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-gray-200" />
      ) : leases.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No leases</p>
        </div>
      ) : (
        leases.map((lease: Record<string, unknown>) => (
          <div key={lease.id as string} className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Unit {(lease.unit as { number: string })?.number}</h3>
                <p className="text-sm text-gray-500">{((lease.unit as { property: { name: string } })?.property)?.name}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(lease.status as string)}`}>{lease.status as string}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Monthly Rent</p><p className="font-medium">{formatCurrency(lease.monthlyRent as number)}</p></div>
              <div><p className="text-sm text-gray-500">Security Deposit</p><p className="font-medium">{lease.securityDeposit ? formatCurrency(lease.securityDeposit as number) : '-'}</p></div>
              <div><p className="text-sm text-gray-500">Start Date</p><p className="font-medium">{formatDate(lease.startDate as string)}</p></div>
              <div><p className="text-sm text-gray-500">End Date</p><p className="font-medium">{formatDate(lease.endDate as string)}</p></div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
