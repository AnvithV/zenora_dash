'use client'

import { useState } from 'react'
import { useMaintenanceRequest, useUpdateMaintenanceRequest, useAddComment } from '@/hooks/use-maintenance'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['CLOSED', 'OPEN'],
  CLOSED: ['OPEN'],
}

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useMaintenanceRequest(id)
  const updateRequest = useUpdateMaintenanceRequest()
  const addComment = useAddComment()

  const [commentContent, setCommentContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
  if (!data?.data) return <div className="rounded-lg border border-red-200 bg-red-50 p-6"><p className="text-red-700">Maintenance request not found</p></div>

  const request = data.data
  const allowedStatuses = STATUS_TRANSITIONS[request.status] ?? []

  const handleAddComment = () => {
    if (!commentContent.trim()) return
    addComment.mutate(
      { requestId: id, data: { content: commentContent, isInternal } },
      {
        onSuccess: () => {
          setCommentContent('')
          setIsInternal(false)
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-md border p-2 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-gray-500">{request.property?.name} - Unit {request.unit?.number}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Request Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{request.category ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <select
                  className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={request.priority}
                  onChange={(e) => updateRequest.mutate({ id, data: { priority: e.target.value } })}
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <select
                  className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={request.status}
                  onChange={(e) => updateRequest.mutate({ id, data: { status: e.target.value } })}
                >
                  <option value={request.status}>{request.status}</option>
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(request.createdAt)}</p>
              </div>
              {request.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="font-medium">{formatDate(request.resolvedAt)}</p>
                </div>
              )}
              {request.closedAt && (
                <div>
                  <p className="text-sm text-gray-500">Closed</p>
                  <p className="font-medium">{formatDate(request.closedAt)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
              {request.description ?? 'No description provided.'}
            </p>
          </div>

          {/* Comments Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Comments</h2>
            <div className="mt-4 space-y-4">
              {request.comments?.length > 0 ? (
                request.comments.map((comment: { id: string; content: string; isInternal: boolean; createdAt: string; author: { name: string; image?: string } }) => (
                  <div
                    key={comment.id}
                    className={`rounded-lg border p-4 ${
                      comment.isInternal
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {comment.author?.image ? (
                        <Image src={comment.author.image} alt="" width={24} height={24} className="h-6 w-6 rounded-full" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-white">
                          {comment.author?.name?.[0] ?? '?'}
                        </div>
                      )}
                      <span className="text-sm font-medium">{comment.author?.name ?? 'Unknown'}</span>
                      {comment.isInternal && (
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Internal
                        </span>
                      )}
                      <span className="ml-auto text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}

              {/* Add Comment Form */}
              <div className="border-t pt-4">
                <textarea
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Add a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Internal comment
                  </label>
                  <button
                    onClick={handleAddComment}
                    disabled={!commentContent.trim() || addComment.isPending}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addComment.isPending ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Requester</h3>
            <div className="mt-3 flex items-center gap-3">
              {request.requester?.image ? (
                <Image src={request.requester.image} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-white">
                  {request.requester?.name?.[0] ?? '?'}
                </div>
              )}
              <div>
                <p className="font-medium">{request.requester?.name ?? '-'}</p>
                <p className="text-sm text-gray-500">{request.requester?.email ?? '-'}</p>
              </div>
            </div>
          </div>

          {request.assignee && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Assignee</h3>
              <div className="mt-3 flex items-center gap-3">
                {request.assignee.image ? (
                  <Image src={request.assignee.image} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-white">
                    {request.assignee.name?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <p className="font-medium">{request.assignee.name ?? '-'}</p>
                  <p className="text-sm text-gray-500">{request.assignee.email ?? '-'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Location</h3>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-medium">{request.property?.name ?? '-'}</p>
              </div>
              {request.property?.address && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{request.property.address}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">{request.unit?.number ?? '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
