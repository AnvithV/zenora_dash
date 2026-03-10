import { z } from 'zod'

export const createUserDocumentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  userId: z.string().min(1, 'User is required'),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  url: z.string(),
})

export type CreateUserDocumentInput = z.infer<typeof createUserDocumentSchema>
