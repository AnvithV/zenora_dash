import { NextResponse } from 'next/server'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function successResponse<T>(data: T, meta?: ApiResponse['meta']) {
  return NextResponse.json({ success: true, data, meta })
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401)
}

export function forbiddenResponse() {
  return errorResponse('Forbidden', 403)
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404)
}
