'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi } from '@/lib/api-client'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getStatusColor } from '@/lib/auth-utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => fetchApi(`/api/applications/${id}`),
    enabled: !!id,
  })

  const reviewMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      mutateApi(`/api/applications/${id}`, 'PATCH', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })

  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
  if (!data?.data) return <div className="rounded-lg border border-red-200 bg-red-50 p-6"><p className="text-red-700">Application not found</p></div>

  const application = data.data
  const canReview = application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW'

  const handleApprove = () => {
    reviewMutation.mutate(
      { status: 'APPROVED', reviewNotes },
      {
        onSuccess: () => {
          setShowApproveDialog(false)
          setReviewNotes('')
        },
      }
    )
  }

  const handleReject = () => {
    reviewMutation.mutate(
      { status: 'REJECTED', reviewNotes },
      {
        onSuccess: () => {
          setShowRejectDialog(false)
          setReviewNotes('')
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
          <h1 className="text-2xl font-bold text-gray-900">Application</h1>
          <p className="text-gray-500">
            {application.applicant?.name ?? 'Unknown Applicant'} - Unit {application.unit?.number}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(application.status)}`}>
          {application.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Application Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="font-medium">{application.applicant?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{application.applicant?.email ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-medium">{application.unit?.property?.name ?? application.property?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">{application.unit?.number ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Desired Move-in Date</p>
                <p className="font-medium">{application.moveInDate ? formatDate(application.moveInDate) : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">{formatDate(application.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{application.status}</p>
              </div>
            </div>
          </div>

          {application.message && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Applicant Message</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{application.message}</p>
            </div>
          )}

          {application.reviewNotes && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Review Notes</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{application.reviewNotes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Applicant Info</h3>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{application.applicant?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{application.applicant?.email ?? '-'}</p>
              </div>
            </div>
          </div>

          {canReview && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Actions</h3>
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Reject Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>Add optional review notes before approving this application.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="block text-sm font-medium text-gray-700">Review Notes</label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes about this approval..."
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowApproveDialog(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={reviewMutation.isPending}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {reviewMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Add review notes explaining the rejection.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="block text-sm font-medium text-gray-700">Review Notes</label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Reason for rejection..."
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowRejectDialog(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={reviewMutation.isPending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {reviewMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
