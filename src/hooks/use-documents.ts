'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useDocuments(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => fetchApi(buildUrl('/api/documents', params)),
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateApi('/api/documents', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mutateApi(`/api/documents/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}
