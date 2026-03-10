import { z } from 'zod'

export const createPropertySchema = z.object({
  name: z.string().min(2, 'Property name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  country: z.string().default('US'),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_CONSTRUCTION']).default('ACTIVE'),
  description: z.string().optional(),
  yearBuilt: z.number().int().min(1800).max(2030).optional(),
  totalUnits: z.number().int().min(0).default(0),
  ownerId: z.string().optional(),
  managerId: z.string().optional(),
})

export const updatePropertySchema = createPropertySchema.partial()

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
