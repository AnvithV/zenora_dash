'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useUnits(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => fetchApi(buildUrl('/api/units', params)),
  })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['units', id],
    queryFn: () => fetchApi(`/api/units/${id}`),
    enabled: !!id,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateApi('/api/units', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      mutateApi(`/api/units/${id}`, 'PATCH', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mutateApi(`/api/units/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  })
}
