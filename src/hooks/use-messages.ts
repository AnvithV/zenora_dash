'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, mutateApi } from '@/lib/api-client'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchApi('/api/messages'),
    refetchInterval: 15000,
  })
}

export function useMessageThread(userId: string) {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: () => fetchApi(`/api/messages/${userId}`),
    enabled: !!userId,
    refetchInterval: 10000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { recipientId: string; content: string }) =>
      mutateApi('/api/messages', 'POST', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages', variables.recipientId] })
    },
  })
}
