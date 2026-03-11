'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useTenantPayments(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['tenant-payments', params],
    queryFn: () => fetchApi(buildUrl('/api/tenant/payments', params)),
  })
}

export function useMarkPaymentPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mutateApi(`/api/tenant/payments/${id}`, 'PATCH', { markPaid: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant-payments'] }),
  })
}
