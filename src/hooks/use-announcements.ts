'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useAnnouncements(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => fetchApi(buildUrl('/api/announcements', params)),
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateApi('/api/announcements', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: () => fetchApi(`/api/announcements/${id}`),
    enabled: !!id,
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      mutateApi(`/api/announcements/${id}`, 'PATCH', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mutateApi(`/api/announcements/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })
}
