import { z } from 'zod'

export const createLeaseSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
  monthlyRent: z.number().min(0, 'Monthly rent must be positive'),
  securityDeposit: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).default('DRAFT'),
  terms: z.string().optional(),
  previousLeaseId: z.string().optional(),
})

export const updateLeaseSchema = createLeaseSchema.partial()

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>
