'use client'

import { useUser, useUpdateUser } from '@/hooks/use-users'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building2, FileText, Wrench, Mail, Phone, Calendar, Clock, Shield, UserCheck, UserX } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { getRoleLabel } from '@/lib/auth-utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useUser(id)
  const updateUser = useUpdateUser()

  if (isLoading) return <LoadingSkeleton />

  if (!data?.data) {
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <p className="font-medium text-red-700">User not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = data.data
  const isLandlord = user.role === 'LANDLORD'
  const isTenant = user.role === 'TENANT'
  const hasLeases = user.leases?.length > 0
  const hasMaintenanceRequests = user.maintenanceRequests?.length > 0
  const hasOwnedProperties = user.ownedProperties?.length > 0
  const hasManagedProperties = user.managedProperties?.length > 0

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'PLATFORM_ADMIN': return 'default'
      case 'LANDLORD': return 'secondary'
      default: return 'outline' as const
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back + Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4 gap-2 text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Button>

        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image} alt={user.name ?? ''} />
            <AvatarFallback className="bg-violet-100 text-lg font-semibold text-violet-700">
              {getInitials(user.name ?? user.email ?? '?')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {user.name ?? 'Unnamed User'}
              </h1>
              <Badge variant={roleBadgeVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <StatusBadge status={user.status} />
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
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
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Phone" value={user.phone ?? 'Not provided'} />
                <InfoRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
                <InfoRow icon={Clock} label="Last Updated" value={formatDate(user.updatedAt)} />
              </dl>

              {user.memberships?.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Organization</p>
                    <div className="flex flex-wrap gap-2">
                      {user.memberships.map((m: { organization: { id: string; name: string } }) => (
                        <Badge key={m.organization.id} variant="secondary">
                          {m.organization.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Role & Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUser.mutate({ id, data: { role: value } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
                      <SelectItem value="LANDLORD">Landlord</SelectItem>
                      <SelectItem value="TENANT">Tenant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                  <Select
                    value={user.status}
                    onValueChange={(value) => updateUser.mutate({ id, data: { status: value } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {updateUser.isPending && (
                <p className="mt-3 text-sm text-slate-500">Saving changes...</p>
              )}
            </CardContent>
          </Card>

          {/* Tenant: Leases */}
          {isTenant && hasLeases && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Leases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.leases.map((lease: Record<string, unknown>) => (
                    <div
                      key={lease.id as string}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Unit {(lease.unit as { number: string }).number} &mdash;{' '}
                          {((lease.unit as { property: { name: string } }).property).name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(lease.startDate as string)} &ndash; {formatDate(lease.endDate as string)}
                        </p>
                      </div>
                      <StatusBadge status={lease.status as string} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tenant: Maintenance Requests */}
          {isTenant && hasMaintenanceRequests && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-4 w-4 text-slate-400" />
                  Maintenance Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.maintenanceRequests.map((req: Record<string, unknown>) => (
                    <div
                      key={req.id as string}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    >
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

          {/* Landlord: Owned Properties */}
          {isLandlord && hasOwnedProperties && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Owned Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.ownedProperties.map((prop: { id: string; name: string }) => (
                    <div
                      key={prop.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <Building2 className="h-4 w-4 text-violet-500" />
                      <p className="text-sm font-medium text-slate-900">{prop.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Landlord: Managed Properties */}
          {isLandlord && hasManagedProperties && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-slate-400" />
                  Managed Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.managedProperties.map((prop: { id: string; name: string }) => (
                    <div
                      key={prop.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <Building2 className="h-4 w-4 text-violet-500" />
                      <p className="text-sm font-medium text-slate-900">{prop.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatRow icon={FileText} label="Leases" value={user._count?.leases ?? 0} />
                <StatRow icon={Wrench} label="Maintenance" value={user._count?.maintenanceRequests ?? 0} />
                <StatRow icon={Building2} label="Owned Properties" value={user._count?.ownedProperties ?? 0} />
                <StatRow icon={Building2} label="Managed Properties" value={user._count?.managedProperties ?? 0} />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {user.status === 'PENDING' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => updateUser.mutate({ id, data: { status: 'ACTIVE' } })}
                  disabled={updateUser.isPending}
                >
                  <UserCheck className="h-4 w-4" />
                  Approve User
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => updateUser.mutate({ id, data: { status: 'SUSPENDED' } })}
                  disabled={updateUser.isPending}
                >
                  <UserX className="h-4 w-4" />
                  Reject User
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
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
