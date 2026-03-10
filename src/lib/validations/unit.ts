import { z } from 'zod'

export const createUnitSchema = z.object({
  number: z.string().min(1, 'Unit number is required'),
  propertyId: z.string().min(1, 'Property is required'),
  floor: z.number().int().optional(),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().min(0).default(1),
  sqft: z.number().int().min(0).optional(),
  rent: z.number().min(0, 'Rent must be positive'),
  deposit: z.number().min(0).optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
  features: z.string().optional(),
})

export const updateUnitSchema = createUnitSchema.partial().omit({ propertyId: true })

export type CreateUnitInput = z.infer<typeof createUnitSchema>
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>
