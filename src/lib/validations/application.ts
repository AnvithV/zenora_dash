import { z } from 'zod'

export const createApplicationSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  propertyId: z.string().min(1, 'Property is required'),
  moveInDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  message: z.string().optional(),
})

export const reviewApplicationSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED']),
  reviewNotes: z.string().optional(),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>
