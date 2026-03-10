import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  targetRoles: z.array(z.enum(['PLATFORM_ADMIN', 'LANDLORD', 'TENANT'])).min(1, 'At least one target role is required'),
  propertyId: z.string().optional(),
  publishedAt: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  expiresAt: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
