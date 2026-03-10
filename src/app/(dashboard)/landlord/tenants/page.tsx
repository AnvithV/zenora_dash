'use client'

import { useState } from 'react'
import { useLandlordTenants } from '@/hooks/use-landlord-tenants'
import { useSendMessage } from '@/hooks/use-messages'
import { Users, Search, MessageSquare, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

export default function LandlordTenantsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [messageTarget, setMessageTarget] = useState<{ id: string; name: string } | null>(null)
  const [messageContent, setMessageContent] = useState('')

  const { data, isLoading } = useLandlordTenants({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    pageSize: 10,
  })
  const sendMessage = useSendMessage()

  const tenants = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleSendMessage = () => {
    if (!messageTarget || !messageContent.trim()) return
    sendMessage.mutate(
      { recipientId: messageTarget.id, content: messageContent.trim() },
      {
        onSuccess: () => {
          setMessageTarget(null)
          setMessageContent('')
          toast({ title: 'Message sent' })
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
        <p className="text-slate-500">{total} tenant{total !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenants..."
            className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex gap-2">
          {['', 'ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED'].map(s => (
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
      </div>

      {/* Tenants Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4"><Skeleton className="h-14 w-full" /></div>
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No tenants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Current Unit</th>
                  <th className="px-6 py-3">Leases</th>
                  <th className="px-6 py-3">Maintenance</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenants.map((tenant: Record<string, unknown>) => {
                  const leases = tenant.leases as Array<Record<string, unknown>>
                  const activeLease = leases?.[0]
                  const unit = activeLease?.unit as Record<string, unknown> | undefined
                  const property = unit?.property as Record<string, unknown> | undefined
                  const counts = tenant._count as Record<string, number>

                  return (
                    <tr
                      key={tenant.id as string}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => router.push(`/landlord/tenants/${tenant.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={tenant.image as string} />
                            <AvatarFallback className="bg-violet-100 text-xs font-medium text-violet-700">
                              {getInitials((tenant.name as string) || (tenant.email as string))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{tenant.name as string}</p>
                            <p className="text-xs text-slate-500">{tenant.email as string}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {unit ? (
                          <>Unit {unit.number as string}, {property?.name as string}</>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{counts?.leases ?? 0}</td>
                      <td className="px-6 py-4 text-slate-700">{counts?.maintenanceRequests ?? 0}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tenant.status as string} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setMessageTarget({ id: tenant.id as string, name: (tenant.name as string) || 'Tenant' })}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <a href={`mailto:${tenant.email as string}`}>
                              <Mail className="h-4 w-4" />
                            </a>
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
            <p className="text-sm text-slate-500">Page {page} of {totalPages} ({total} total)</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Message Dialog */}
      <Dialog open={!!messageTarget} onOpenChange={(open) => { if (!open) { setMessageTarget(null); setMessageContent('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {messageTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setMessageTarget(null); setMessageContent('') }}>Cancel</Button>
              <Button onClick={handleSendMessage} disabled={!messageContent.trim() || sendMessage.isPending}>
                {sendMessage.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
