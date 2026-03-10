import { z } from 'zod'

export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
})
