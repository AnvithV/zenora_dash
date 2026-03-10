import { z } from 'zod'

export const createMaintenanceSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.enum([
    'PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL',
    'PEST_CONTROL', 'LANDSCAPING', 'GENERAL', 'OTHER'
  ]).default('GENERAL'),
  unitId: z.string().min(1, 'Unit is required'),
  propertyId: z.string().min(1, 'Property is required'),
})

export const updateMaintenanceSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.enum([
    'PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL',
    'PEST_CONTROL', 'LANDSCAPING', 'GENERAL', 'OTHER'
  ]).optional(),
  assigneeId: z.string().nullable().optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required'),
  isInternal: z.boolean().default(false),
})

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
