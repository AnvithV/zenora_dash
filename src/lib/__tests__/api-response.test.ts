import { describe, it, expect } from 'vitest'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-response'

describe('successResponse', () => {
  it('returns a response with success: true and data', async () => {
    const data = { id: 1, name: 'Test' }
    const response = successResponse(data)
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.data).toEqual(data)
    expect(response.status).toBe(200)
  })

  it('includes meta when provided', async () => {
    const data = [{ id: 1 }, { id: 2 }]
    const meta = { page: 1, pageSize: 10, total: 50, totalPages: 5 }
    const response = successResponse(data, meta)
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.data).toEqual(data)
    expect(body.meta).toEqual(meta)
  })

  it('does not include meta when not provided', async () => {
    const response = successResponse('hello')
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.data).toBe('hello')
    expect(body.meta).toBeUndefined()
  })

  it('handles null data', async () => {
    const response = successResponse(null)
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.data).toBeNull()
  })
})

describe('errorResponse', () => {
  it('returns a response with success: false and error message', async () => {
    const response = errorResponse('Something went wrong')
    const body = await response.json()

    expect(body.success).toBe(false)
    expect(body.error).toBe('Something went wrong')
  })

  it('defaults to 400 status code', () => {
    const response = errorResponse('Bad request')
    expect(response.status).toBe(400)
  })

  it('accepts a custom status code', () => {
    const response = errorResponse('Server error', 500)
    expect(response.status).toBe(500)
  })

  it('does not include data field', async () => {
    const response = errorResponse('Error')
    const body = await response.json()

    expect(body.data).toBeUndefined()
  })
})

describe('unauthorizedResponse', () => {
  it('returns 401 status', () => {
    const response = unauthorizedResponse()
    expect(response.status).toBe(401)
  })

  it('returns "Unauthorized" error message', async () => {
    const response = unauthorizedResponse()
    const body = await response.json()

    expect(body.success).toBe(false)
    expect(body.error).toBe('Unauthorized')
  })
})

describe('forbiddenResponse', () => {
  it('returns 403 status', () => {
    const response = forbiddenResponse()
    expect(response.status).toBe(403)
  })

  it('returns "Forbidden" error message', async () => {
    const response = forbiddenResponse()
    const body = await response.json()

    expect(body.success).toBe(false)
    expect(body.error).toBe('Forbidden')
  })
})

describe('notFoundResponse', () => {
  it('returns 404 status', () => {
    const response = notFoundResponse()
    expect(response.status).toBe(404)
  })

  it('returns default "Resource not found" message', async () => {
    const response = notFoundResponse()
    const body = await response.json()

    expect(body.success).toBe(false)
    expect(body.error).toBe('Resource not found')
  })

  it('returns custom resource name in message', async () => {
    const response = notFoundResponse('Property')
    const body = await response.json()

    expect(body.error).toBe('Property not found')
  })

  it('returns custom resource name for User', async () => {
    const response = notFoundResponse('User')
    const body = await response.json()

    expect(body.error).toBe('User not found')
  })
})
