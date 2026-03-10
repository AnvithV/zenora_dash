'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useMaintenanceRequests(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['maintenance', params],
    queryFn: () => fetchApi(buildUrl('/api/maintenance', params)),
  })
}

export function useMaintenanceRequest(id: string) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => fetchApi(`/api/maintenance/${id}`),
    enabled: !!id,
  })
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateApi('/api/maintenance', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      mutateApi(`/api/maintenance/${id}`, 'PATCH', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: Record<string, unknown> }) =>
      mutateApi(`/api/maintenance/${requestId}/comments`, 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}
