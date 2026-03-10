'use client'

import { useQuery } from '@tanstack/react-query'

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await fetch('/api/admin/overview')
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    },
  })
}
