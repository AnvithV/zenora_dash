'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { useMaintenanceRequest, useAddComment } from '@/hooks/use-maintenance'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate, formatDateTime, getInitials } from '@/lib/utils'

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useMaintenanceRequest(id)
  const addComment = useAddComment()
  const [comment, setComment] = useState('')

  const request = data?.data

  const handleSubmitComment = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!comment.trim()) return
    addComment.mutate(
      { requestId: id, data: { content: comment.trim() } },
      { onSuccess: () => setComment('') },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.push('/dashboard/maintenance')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" /> Back to Maintenance
        </button>
        <p className="text-slate-500 dark:text-slate-400">Request not found</p>
      </div>
    )
  }

  const comments = request.comments ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => router.push('/dashboard/maintenance')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Maintenance
      </button>

      {/* Request Details */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{request.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {request.property?.name} / Unit {request.unit?.number}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{request.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Category</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{request.category?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Submitted</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(request.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Last Updated</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(request.updatedAt)}</p>
          </div>
          {request.resolvedAt && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Resolved</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(request.resolvedAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Comments ({comments.length})</h2>
        </div>

        {comments.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No comments yet</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {comments.map((c: Record<string, unknown>) => {
              const author = c.author as { name?: string; email?: string } | null
              return (
                <div key={c.id as string} className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                      {getInitials(author?.name ?? 'U')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{author?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(c.createdAt as string)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.content as string}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Comment Form */}
        <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          {addComment.isError && (
            <p className="mb-2 text-sm text-red-600 dark:text-red-400">Failed to add comment. Please try again.</p>
          )}
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              aria-label="Add a comment"
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!comment.trim() || addComment.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
