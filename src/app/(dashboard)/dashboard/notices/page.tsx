'use client'

import { useAnnouncements } from '@/hooks/use-announcements'
import { Bell } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function UserNoticesPage() {
  const { data, isLoading } = useAnnouncements({})
  const announcements = data?.items ?? []

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Notices & Announcements</h1></div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />)
      ) : announcements.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No announcements</p>
        </div>
      ) : (
        announcements.map((ann: Record<string, unknown>) => (
          <div key={ann.id as string} className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{ann.title as string}</h3>
              {typeof ann.priority === 'string' && ann.priority !== 'LOW' && (
                <span className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">{String(ann.priority)}</span>
              )}
            </div>
            <p className="mt-2 text-gray-700">{ann.content as string}</p>
            <p className="mt-3 text-xs text-gray-400">
              Posted by {(ann.author as { name: string })?.name} on {formatDate(ann.createdAt as string)}
            </p>
          </div>
        ))
      )}
    </div>
  )
}
