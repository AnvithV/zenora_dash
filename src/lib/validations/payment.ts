import { z } from 'zod'

export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  leaseId: z.string().min(1, 'Lease is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  method: z.string().optional(),
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  method: z.string().optional(),
  transactionId: z.string().optional(),
  paidAt: z.string().nullable().optional(),
  dueDate: z.string().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
