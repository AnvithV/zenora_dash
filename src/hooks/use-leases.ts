'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useLeases(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['leases', params],
    queryFn: () => fetchApi(buildUrl('/api/leases', params)),
  })
}

export function useLease(id: string) {
  return useQuery({
    queryKey: ['leases', id],
    queryFn: () => fetchApi(`/api/leases/${id}`),
    enabled: !!id,
  })
}

export function useCreateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateApi('/api/leases', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leases'] }),
  })
}

export function useUpdateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      mutateApi(`/api/leases/${id}`, 'PATCH', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leases'] }),
  })
}
