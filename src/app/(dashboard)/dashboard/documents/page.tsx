'use client'

import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileBox, Download, Plus, FileUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { fetchApi } from '@/lib/api-client'
import { useUserDocuments } from '@/hooks/use-user-documents'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function UserDocumentsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: () => fetchApi('/api/documents'),
  })

  const documents = data?.items ?? []

  // Admin-assigned documents (shared with this user)
  const { data: sharedData, isLoading: sharedLoading } = useUserDocuments()
  const sharedDocuments = (sharedData?.data ?? []) as Array<{
    id: string
    name: string
    description?: string
    fileName: string
    fileSize: number
    url: string
    createdAt: string
    uploadedBy?: { name?: string }
  }>

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('OTHER')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setUploadError('Please select a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadJson = await uploadRes.json()
      if (!uploadJson.success) throw new Error(uploadJson.error ?? 'Upload failed')

      const { url, fileName, fileSize, mimeType } = uploadJson.data

      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: docName || fileName,
          fileName,
          fileSize,
          mimeType,
          url,
          type: docType,
        }),
      })
      const docJson = await docRes.json()
      if (!docJson.success) throw new Error(docJson.error ?? 'Failed to save document')

      queryClient.invalidateQueries({ queryKey: ['my-documents'] })
      setUploadOpen(false)
      setDocName('')
      setDocType('OTHER')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">My Documents</h1></div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" /> Upload Document
        </button>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <FileBox className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No documents</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-200">
            {documents.map((doc: Record<string, unknown>) => (
              <div key={doc.id as string} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium">{doc.name as string}</p>
                  <p className="text-sm text-slate-500">{(doc.type as string).replace('_', ' ')} - {formatDate(doc.createdAt as string)}</p>
                </div>
                <a href={doc.url as string} target="_blank" rel="noopener noreferrer" className="rounded-md border border-slate-200 px-3 py-1 text-sm text-violet-600 hover:bg-violet-50">
                  <Download className="inline h-4 w-4 mr-1" />Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Documents (admin-assigned) */}
      {sharedLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-slate-200" />
      ) : sharedDocuments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Shared with you</h2>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-200">
              {sharedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(doc.createdAt)}
                      {doc.uploadedBy?.name && <> &middot; from {doc.uploadedBy.name}</>}
                      {doc.description && <> &middot; {doc.description}</>}
                    </p>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-slate-200 px-3 py-1 text-sm text-violet-600 hover:bg-violet-50">
                    <Download className="inline h-4 w-4 mr-1" />Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Select a file and provide details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">File</label>
              <input type="file" required ref={fileRef} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Document Name</label>
              <input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder="Optional - defaults to file name" className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="LEASE_AGREEMENT">Lease Agreement</option>
                <option value="ID_DOCUMENT">ID Document</option>
                <option value="PROOF_OF_INCOME">Proof of Income</option>
                <option value="INSURANCE">Insurance</option>
                <option value="INSPECTION_REPORT">Inspection Report</option>
                <option value="MAINTENANCE_PHOTO">Maintenance Photo</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            <DialogFooter>
              <button type="button" onClick={() => setUploadOpen(false)} className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={uploading} className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
