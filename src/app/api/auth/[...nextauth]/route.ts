import { handlers } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export const { GET } = handlers

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { success, resetIn } = rateLimit(`auth:${ip}`, RATE_LIMITS.AUTH_LOGIN)
  if (!success) return rateLimitResponse(resetIn)
  return handlers.POST(req)
}
