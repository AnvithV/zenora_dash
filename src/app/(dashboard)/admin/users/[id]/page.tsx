'use client'

import { useRef, useState } from 'react'
import { useUser, useUsers, useUpdateUser, useSendEmail } from '@/hooks/use-users'
import { useSendMessage } from '@/hooks/use-messages'
import { useUserDocuments, useCreateUserDocument, useDeleteUserDocument } from '@/hooks/use-user-documents'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building2, FileText, FileUp, Wrench, Mail, Phone, Calendar, Clock, Shield, UserCheck, UserX, MessageSquare, Trash2, Download, Upload, Pencil, Check, X, Users, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { formatDate, getInitials } from '@/lib/utils'
import { getRoleLabel } from '@/lib/auth-utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useUser(id)
  const updateUser = useUpdateUser()
  const sendMessage = useSendMessage()
  const sendEmail = useSendEmail()

  // Documents
  const { data: docsData } = useUserDocuments({ userId: id })
  const createDocument = useCreateUserDocument()
  const deleteDocument = useDeleteUserDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dialog state
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  // Document upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [docName, setDocName] = useState('')
  const [docDescription, setDocDescription] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Document delete confirmation state
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)

  // Landlord assignment state
  const [selectedLandlordId, setSelectedLandlordId] = useState<string>('')

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')

  // Fetch landlords list for tenant assignment dropdown — must be before early returns
  const { data: landlordsData } = useUsers({ role: 'LANDLORD', pageSize: 100 })

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

  const handleSendMessage = () => {
    if (!messageContent.trim()) return
    sendMessage.mutate(
      { recipientId: id, content: messageContent },
      {
        onSuccess: () => {
          setShowMessageDialog(false)
          setMessageContent('')
        },
      },
    )
  }

  const documents = (docsData?.items ?? []) as Array<{
    id: string
    name: string
    description?: string
    fileName: string
    fileSize: number
    mimeType: string
    url: string
    createdAt: string
    uploadedBy?: { name?: string }
  }>

  const handleUploadDocument = async () => {
    if (!docName.trim() || !docFile) return
    setUploadError('')
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', docFile)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Upload failed')
      }
      const uploadResult = await res.json()
      const { url, fileName, fileSize, mimeType } = uploadResult.data
      createDocument.mutate(
        { name: docName.trim(), description: docDescription.trim() || undefined, userId: id, url, fileName, fileSize, mimeType },
        {
          onSuccess: () => {
            setShowUploadDialog(false)
            setDocName('')
            setDocDescription('')
            setDocFile(null)
            toast({ title: 'Document uploaded', description: `"${docName.trim()}" has been uploaded.` })
          },
          onError: () => setUploadError('Failed to save document record.'),
        },
      )
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = () => {
    if (!deleteDocId) return
    deleteDocument.mutate(deleteDocId, {
      onSuccess: () => {
        setDeleteDocId(null)
        toast({ title: 'Document deleted' })
      },
    })
  }

  const startEditingProfile = () => {
    setEditName(user.name ?? '')
    setEditEmail(user.email)
    setEditPhone(user.phone ?? '')
    setEditingProfile(true)
  }

  const handleSaveProfile = () => {
    const changes: Record<string, string> = {}
    if (editName.trim() !== (user.name ?? '')) changes.name = editName.trim()
    if (editEmail.trim() !== user.email) changes.email = editEmail.trim()
    if (editPhone.trim() !== (user.phone ?? '')) changes.phone = editPhone.trim()

    if (Object.keys(changes).length === 0) {
      setEditingProfile(false)
      return
    }

    updateUser.mutate(
      { id, data: changes },
      {
        onSuccess: () => {
          setEditingProfile(false)
          toast({ title: 'Profile updated', description: 'User profile has been saved.' })
        },
      },
    )
  }

  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailBody.trim()) return
    sendEmail.mutate(
      { to: user.email, subject: emailSubject, body: emailBody },
      {
        onSuccess: () => {
          setShowEmailDialog(false)
          setEmailSubject('')
          setEmailBody('')
        },
      },
    )
  }

  const handleAssignLandlord = () => {
    if (!selectedLandlordId) return
    updateUser.mutate(
      { id, data: { assignedLandlordId: selectedLandlordId } },
      {
        onSuccess: () => {
          setSelectedLandlordId('')
          toast({ title: 'Landlord assigned', description: 'Tenant has been assigned to the landlord.' })
        },
      },
    )
  }

  const handleUnassignLandlord = () => {
    updateUser.mutate(
      { id, data: { assignedLandlordId: null } },
      {
        onSuccess: () => {
          toast({ title: 'Landlord unassigned', description: 'Tenant has been unassigned from the landlord.' })
        },
      },
    )
  }

  const handleRemoveTenant = (tenantId: string) => {
    updateUser.mutate(
      { id: tenantId, data: { assignedLandlordId: null } },
      {
        onSuccess: () => {
          toast({ title: 'Tenant removed', description: 'Tenant has been unassigned from this landlord.' })
        },
      },
    )
  }

  const landlords = (landlordsData?.items ?? []) as Array<{ id: string; name: string | null; email: string }>

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowMessageDialog(true)}
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Profile Information</CardTitle>
              {!editingProfile ? (
                <Button variant="ghost" size="sm" className="gap-2" onClick={startEditingProfile}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="gap-1 text-green-600 hover:text-green-700" onClick={handleSaveProfile} disabled={updateUser.isPending}>
                    <Check className="h-4 w-4" />
                    {updateUser.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setEditingProfile(false)} disabled={updateUser.isPending}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input id="edit-phone" type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Not provided" className="mt-1.5" />
                  </div>
                </div>
              ) : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow icon={Mail} label="Email" value={user.email} />
                  <InfoRow icon={Phone} label="Phone" value={user.phone ?? 'Not provided'} />
                  <InfoRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
                  <InfoRow icon={Clock} label="Last Updated" value={formatDate(user.updatedAt)} />
                </dl>
              )}

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
                  {user.role === 'PLATFORM_ADMIN' ? (
                    <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                      Platform Admin
                    </div>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUser.mutate({ id, data: { role: value } })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LANDLORD">Landlord</SelectItem>
                        <SelectItem value="TENANT">Tenant</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileUp className="h-4 w-4 text-slate-400" />
                Documents
                {documents.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{documents.length}</Badge>
                )}
              </CardTitle>
              <Button size="sm" className="gap-2" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="py-8 text-center">
                  <FileUp className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No documents yet</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setShowUploadDialog(true)}>
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(doc.fileSize)} &middot; {formatDate(doc.createdAt)}
                          {doc.uploadedBy?.name && <> &middot; by {doc.uploadedBy.name}</>}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" title="Download">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteDocId(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
          {/* Landlord: Assigned Tenants */}
          {isLandlord && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-slate-400" />
                  Assigned Tenants
                  {user.assignedTenants?.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{user.assignedTenants.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!user.assignedTenants || user.assignedTenants.length === 0) ? (
                  <div className="py-6 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">No tenants assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.assignedTenants.map((tenant: { id: string; name: string | null; email: string; status: string }) => (
                      <div
                        key={tenant.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                      >
                        <div>
                          <Link
                            href={`/admin/users/${tenant.id}`}
                            className="text-sm font-medium text-violet-600 hover:underline"
                          >
                            {tenant.name ?? 'Unnamed'}
                          </Link>
                          <p className="text-xs text-slate-500">{tenant.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={tenant.status} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleRemoveTenant(tenant.id)}
                            disabled={updateUser.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <StatRow icon={FileUp} label="Documents" value={documents.length} />
                <StatRow icon={Wrench} label="Maintenance" value={user._count?.maintenanceRequests ?? 0} />
                <StatRow icon={Building2} label="Owned Properties" value={user._count?.ownedProperties ?? 0} />
                <StatRow icon={Building2} label="Managed Properties" value={user._count?.managedProperties ?? 0} />
              </div>
            </CardContent>
          </Card>

          {/* Assigned Landlord (for tenants) */}
          {isTenant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                  Assigned Landlord
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.assignedLandlord ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                      <div>
                        <Link
                          href={`/admin/users/${user.assignedLandlord.id}`}
                          className="text-sm font-medium text-violet-600 hover:underline"
                        >
                          {user.assignedLandlord.name ?? 'Unnamed'}
                        </Link>
                        <p className="text-xs text-slate-500">{user.assignedLandlord.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={handleUnassignLandlord}
                        disabled={updateUser.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500">Not assigned</p>
                    <Select value={selectedLandlordId} onValueChange={setSelectedLandlordId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a landlord..." />
                      </SelectTrigger>
                      <SelectContent>
                        {landlords.map((ll) => (
                          <SelectItem key={ll.id} value={ll.id}>
                            {ll.name ?? ll.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleAssignLandlord}
                      disabled={!selectedLandlordId || updateUser.isPending}
                    >
                      {updateUser.isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={(open) => { if (!open) { setShowMessageDialog(false); setMessageContent('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {user.name ?? 'Unnamed User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowMessageDialog(false); setMessageContent('') }}>
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={(open) => { if (!open) { setShowEmailDialog(false); setEmailSubject(''); setEmailBody('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email {user.name ?? 'Unnamed User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm text-slate-500">To: {user.email}</p>
            </div>
            <Input
              placeholder="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <Textarea
              placeholder="Email body..."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowEmailDialog(false); setEmailSubject(''); setEmailBody('') }}>
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={!emailSubject.trim() || !emailBody.trim() || sendEmail.isPending}
              >
                {sendEmail.isPending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => { if (!open) { setShowUploadDialog(false); setDocName(''); setDocDescription(''); setDocFile(null); setUploadError('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a document for {user.name ?? 'this user'}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc-name">Name *</Label>
              <Input id="doc-name" placeholder="e.g. Lease Agreement" value={docName} onChange={(e) => setDocName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="doc-desc">Description</Label>
              <Textarea id="doc-desc" placeholder="Optional description..." value={docDescription} onChange={(e) => setDocDescription(e.target.value)} rows={2} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="doc-file">File *</Label>
              <Input
                id="doc-file"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.csv"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                className="mt-1.5"
              />
            </div>
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUploadDialog(false); setDocName(''); setDocDescription(''); setDocFile(null); setUploadError('') }}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={!docName.trim() || !docFile || isUploading || createDocument.isPending}>
              {isUploading || createDocument.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Confirmation */}
      <ConfirmDialog
        open={!!deleteDocId}
        onOpenChange={(open) => { if (!open) setDeleteDocId(null) }}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel={deleteDocument.isPending ? 'Deleting...' : 'Delete'}
        onConfirm={handleDeleteDocument}
        variant="destructive"
      />
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
