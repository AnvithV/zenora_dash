import { NextResponse } from 'next/server'

export const RATE_LIMITS = {
  AUTH_LOGIN: { limit: 10, windowMs: 60_000 },
  AUTH_STRICT: { limit: 5, windowMs: 60_000 },
  UPLOAD: { limit: 20, windowMs: 60_000 },
} as const

type RateLimitConfig = { limit: number; windowMs: number }
type RateLimitEntry = { count: number; resetTime: number }

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 60s
const cleanup = setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key)
  }
}, 60_000)
cleanup.unref()

export function rateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs })
    return { success: true, remaining: config.limit - 1, resetIn: config.windowMs }
  }

  entry.count++
  const resetIn = entry.resetTime - now
  if (entry.count > config.limit) {
    return { success: false, remaining: 0, resetIn }
  }
  return { success: true, remaining: config.limit - entry.count, resetIn }
}

export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
  )
}
