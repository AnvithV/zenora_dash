import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MAX_PAGE_SIZE } from '@/lib/constants'

/**
 * Sanitize error and return appropriate HTTP response.
 * Prevents internal details (DB schema, stack traces) from leaking to clients.
 */
export function apiError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, error: error.errors[0].message },
      { status: 400 }
    )
  }

  const message = error instanceof Error ? error.message : ''

  if (message === 'Unauthorized') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (message === 'Forbidden') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  if (message.toLowerCase().includes('not found')) {
    return NextResponse.json({ success: false, error: message }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
}

/** Clamp user-provided pageSize to MAX_PAGE_SIZE */
export function clampPageSize(raw: string | null, fallback = 10): number {
  const val = Number(raw) || fallback
  return Math.min(Math.max(val, 1), MAX_PAGE_SIZE)
}
