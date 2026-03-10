'use client'

import { useState } from 'react'
import { useAnnouncements, useDeleteAnnouncement, useCreateAnnouncement } from '@/hooks/use-announcements'
import { useProperties } from '@/hooks/use-properties'
import { Bell, Trash2, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const ROLES = ['PLATFORM_ADMIN', 'LANDLORD', 'TENANT']

const initialForm = {
  title: '',
  content: '',
  priority: 'normal',
  targetRoles: [] as string[],
  propertyId: '',
  publishedAt: '',
  expiresAt: '',
}

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const { data, isLoading } = useAnnouncements({ page, pageSize: 10 })
  const deleteAnnouncement = useDeleteAnnouncement()
  const createMutation = useCreateAnnouncement()
  const { data: propertiesData } = useProperties({ pageSize: 100 })

  const announcements = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(
      {
        title: form.title,
        content: form.content,
        priority: form.priority,
        targetRoles: form.targetRoles,
        propertyId: form.propertyId || undefined,
        publishedAt: form.publishedAt || undefined,
        expiresAt: form.expiresAt || undefined,
      },
      { onSuccess: () => { setCreateOpen(false); setForm(initialForm) } }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Announcements</h1><p className="text-gray-500">{total} total</p></div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />))
        ) : announcements.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No announcements</p>
          </div>
        ) : (
          announcements.map((ann: Record<string, unknown>) => (
            <div key={ann.id as string} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{ann.title as string}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    By {(ann.author as { name: string })?.name} on {formatDate(ann.createdAt as string)}
                    {ann.priority !== 'normal' && <span className="ml-2 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">{ann.priority as string}</span>}
                  </p>
                </div>
                <button onClick={() => { if (confirm('Delete?')) deleteAnnouncement.mutate(ann.id as string) }} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-gray-700">{ann.content as string}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {(ann.targetRoles as string[])?.map((role: string) => (
                  <span key={role} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{role.replace('_', ' ')}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Property (optional)</label>
                <select value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">All properties</option>
                  {(propertiesData?.items ?? []).map((p: Record<string, unknown>) => (
                    <option key={p.id as string} value={p.id as string}>{p.name as string}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles</label>
              <div className="flex flex-wrap gap-3">
                {ROLES.map(role => (
                  <label key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.targetRoles.includes(role)}
                      onChange={e => setForm(f => ({
                        ...f,
                        targetRoles: e.target.checked
                          ? [...f.targetRoles, role]
                          : f.targetRoles.filter(r => r !== role),
                      }))}
                    />
                    <span className="text-sm">{role.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                <input type="datetime-local" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expires At</label>
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
