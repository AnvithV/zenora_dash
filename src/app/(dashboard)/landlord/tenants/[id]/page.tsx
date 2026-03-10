'use client'

import { useState } from 'react'
import { useLandlordTenant } from '@/hooks/use-landlord-tenants'
import { useSendMessage } from '@/hooks/use-messages'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Wrench, Mail, Phone, Calendar, Clock, MessageSquare, Download } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

export default function LandlordTenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useLandlordTenant(id)
  const sendMessage = useSendMessage()

  const [showMessage, setShowMessage] = useState(false)
  const [messageContent, setMessageContent] = useState('')

  if (isLoading) return <LoadingSkeleton />

  if (!data?.data) {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <p className="font-medium text-red-700">Tenant not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tenant = data.data
  const counts = tenant._count as Record<string, number>

  const handleSendMessage = () => {
    if (!messageContent.trim()) return
    sendMessage.mutate(
      { recipientId: id, content: messageContent.trim() },
      {
        onSuccess: () => {
          setShowMessage(false)
          setMessageContent('')
          toast({ title: 'Message sent' })
        },
      },
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4 gap-2 text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back to Tenants
        </Button>

        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={tenant.image} alt={tenant.name ?? ''} />
            <AvatarFallback className="bg-violet-100 text-lg font-semibold text-violet-700">
              {getInitials(tenant.name ?? tenant.email ?? '?')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {tenant.name ?? 'Unnamed Tenant'}
              </h1>
              <StatusBadge status={tenant.status} />
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{tenant.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowMessage(true)}>
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={`mailto:${tenant.email}`}>
                <Mail className="h-4 w-4" />
                Send Email
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={Mail} label="Email" value={tenant.email} />
                <InfoRow icon={Phone} label="Phone" value={tenant.phone ?? 'Not provided'} />
                <InfoRow icon={Calendar} label="Joined" value={formatDate(tenant.createdAt)} />
                <InfoRow icon={Clock} label="Last Updated" value={formatDate(tenant.updatedAt)} />
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          {tenant.userDocuments?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Documents
                  <Badge variant="secondary">{tenant.userDocuments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.userDocuments.map((doc: Record<string, unknown>) => (
                    <div key={doc.id as string} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.name as string}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(doc.fileSize as number)} &middot; {formatDate(doc.createdAt as string)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={doc.url as string} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leases */}
          {tenant.leases?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Leases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.leases.map((lease: Record<string, unknown>) => {
                    const unit = lease.unit as Record<string, unknown>
                    const property = (unit.property as Record<string, unknown>)
                    return (
                      <div key={lease.id as string} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Unit {unit.number as string} &mdash; {property.name as string}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(lease.startDate as string)} &ndash; {formatDate(lease.endDate as string)}
                          </p>
                        </div>
                        <StatusBadge status={lease.status as string} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance Requests */}
          {tenant.maintenanceRequests?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-4 w-4 text-slate-400" />
                  Maintenance Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.maintenanceRequests.map((req: Record<string, unknown>) => (
                    <div key={req.id as string} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{req.title as string}</p>
                        <p className="text-xs text-slate-500">{formatDate(req.createdAt as string)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={req.priority as string} />
                        <StatusBadge status={req.status as string} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatRow icon={FileText} label="Leases" value={counts?.leases ?? 0} />
                <StatRow icon={Wrench} label="Maintenance" value={counts?.maintenanceRequests ?? 0} />
                <StatRow icon={Download} label="Documents" value={counts?.userDocuments ?? 0} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessage} onOpenChange={(open) => { if (!open) { setShowMessage(false); setMessageContent('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {tenant.name ?? 'Tenant'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowMessage(false); setMessageContent('') }}>Cancel</Button>
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

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div>
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="text-sm font-medium text-slate-900">{value}</dd>
      </div>
    </div>
  )
}

function StatRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-4 h-8 w-24" />
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  )
}
