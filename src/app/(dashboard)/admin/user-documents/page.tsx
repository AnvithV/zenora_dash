'use client'

import { useState } from 'react'
import { useUserDocuments, useCreateUserDocument, useDeleteUserDocument } from '@/hooks/use-user-documents'
import { useUsers } from '@/hooks/use-users'
import { FileUp, Trash2, Search, Plus, FileText, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminUserDocumentsPage() {
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Upload form state
  const [uploadUserId, setUploadUserId] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [userSearch, setUserSearch] = useState('')

  const { data, isLoading } = useUserDocuments({
    search,
    userId: userFilter || undefined,
    page,
    pageSize: 10,
  })
  const { data: usersData } = useUsers({ search: userSearch, pageSize: 20 })
  const createDocument = useCreateUserDocument()
  const deleteDocument = useDeleteUserDocument()

  const documents = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const users = usersData?.items ?? []

  const handleUpload = async () => {
    if (!uploadFile || !uploadUserId || !uploadName) return

    // In a real app, you'd upload the file to storage first and get back a URL
    // For now, we create a local URL
    const url = URL.createObjectURL(uploadFile)

    createDocument.mutate(
      {
        name: uploadName,
        description: uploadDescription || undefined,
        userId: uploadUserId,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        mimeType: uploadFile.type,
        url,
      },
      {
        onSuccess: () => {
          setShowUpload(false)
          setUploadUserId('')
          setUploadName('')
          setUploadDescription('')
          setUploadFile(null)
          setUserSearch('')
        },
      },
    )
  }

  const handleDelete = (id: string) => {
    deleteDocument.mutate(id, {
      onSuccess: () => setDeleteId(null),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Documents</h1>
          <p className="text-gray-500">{total} total documents</p>
        </div>
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Select User</label>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                {userSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-md border border-gray-200 bg-white">
                    {users.map((u: { id: string; name: string; email: string }) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setUploadUserId(u.id)
                          setUserSearch(u.name || u.email)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        <span className="font-medium">{u.name}</span>
                        <span className="text-gray-400">{u.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lease Agreement"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea
                  placeholder="Brief description..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">File</label>
                <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                  <label className="flex cursor-pointer flex-col items-center gap-2">
                    <FileUp className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {uploadFile ? uploadFile.name : 'Click to select a file'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                {uploadFile && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formatFileSize(uploadFile.size)} - {uploadFile.type || 'Unknown type'}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || !uploadUserId || !uploadName || createDocument.isPending}
              >
                {createDocument.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All Users</option>
          {users.map((u: { id: string; name: string }) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Uploaded</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-6 animate-pulse rounded bg-gray-200" />
                  </td>
                </tr>
              ))
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No documents found</p>
                </td>
              </tr>
            ) : (
              documents.map(
                (doc: {
                  id: string
                  name: string
                  description?: string
                  fileName: string
                  fileSize: number
                  mimeType: string
                  url: string
                  createdAt: string
                  user: { id: string; name: string; email: string }
                }) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{doc.user?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{doc.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doc.mimeType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(doc.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => setDeleteId(doc.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this document? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteDocument.isPending}
            >
              {deleteDocument.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
