'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi, buildUrl } from '@/lib/api-client'
import type { QueryParams } from '@/types/api'

export function useNotifications(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => fetchApi(buildUrl('/api/notifications', params)),
    refetchInterval: 30000,
  })
}

export function useUnreadNotificationCount() {
  const { data } = useNotifications({ read: 'false' })
  return data?.unreadCount ?? 0
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { ids?: string[]; all?: boolean }) =>
      mutateApi('/api/notifications', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
