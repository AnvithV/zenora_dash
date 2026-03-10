'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api-client'

export function useLandlordLeases() {
  return useQuery({
    queryKey: ['landlord-leases'],
    queryFn: () => fetchApi('/api/landlord/leases'),
  })
}
