'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useApplications(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => fetchApi(buildUrl('/api/applications', params)),
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => fetchApi(`/api/applications/${id}`),
    enabled: !!id,
  })
}

export function useReviewApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      mutateApi(`/api/applications/${id}`, 'PATCH', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      mutateApi(`/api/applications/${id}`, 'PATCH', { action: 'withdraw' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
