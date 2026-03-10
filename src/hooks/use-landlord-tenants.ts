'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useLandlordTenants(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['landlord-tenants', params],
    queryFn: () => fetchApi(buildUrl('/api/landlord/tenants', params)),
  })
}

export function useLandlordTenant(id: string) {
  return useQuery({
    queryKey: ['landlord-tenants', id],
    queryFn: () => fetchApi(`/api/landlord/tenants/${id}`),
    enabled: !!id,
  })
}
