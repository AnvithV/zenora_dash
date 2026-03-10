'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useUserDocuments(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['user-documents', params],
    queryFn: () => fetchApi(buildUrl('/api/user-documents', params)),
  })
}

export function useCreateUserDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; userId: string; fileName: string; fileSize: number; mimeType: string; url: string }) =>
      mutateApi('/api/user-documents', 'POST', data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] })
    },
  })
}

export function useDeleteUserDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mutateApi(`/api/user-documents/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] })
    },
  })
}
