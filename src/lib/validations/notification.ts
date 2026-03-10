import { z } from 'zod'

export const markNotificationsReadSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
}).refine(data => data.ids || data.all, { message: 'Provide ids or all' })

export type MarkNotificationsReadInput = z.infer<typeof markNotificationsReadSchema>
