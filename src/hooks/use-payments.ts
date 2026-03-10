'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function usePayments(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['landlord-payments', params],
    queryFn: () => fetchApi(buildUrl('/api/landlord/payments', params)),
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['landlord-payments', id],
    queryFn: () => fetchApi(`/api/landlord/payments/${id}`),
    enabled: !!id,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { amount: number; leaseId: string; dueDate: string; method?: string }) =>
      mutateApi('/api/landlord/payments', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-payments'] }),
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      mutateApi(`/api/landlord/payments/${id}`, 'PATCH', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-payments'] }),
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mutateApi(`/api/landlord/payments/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-payments'] }),
  })
}
