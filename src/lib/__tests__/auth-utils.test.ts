import { describe, it, expect, vi } from 'vitest'

// Mock the auth module to avoid importing next-auth/next/server in test environment
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import {
  isAdminRole,
  isPlatformAdmin,
  getRoleLabel,
  getStatusColor,
} from '@/lib/auth-utils'

describe('isAdminRole', () => {
  it('returns true for PLATFORM_ADMIN', () => {
    expect(isAdminRole('PLATFORM_ADMIN')).toBe(true)
  })

  it('returns true for LANDLORD', () => {
    expect(isAdminRole('LANDLORD')).toBe(true)
  })

  it('returns false for TENANT', () => {
    expect(isAdminRole('TENANT')).toBe(false)
  })
})

describe('isPlatformAdmin', () => {
  it('returns true for PLATFORM_ADMIN', () => {
    expect(isPlatformAdmin('PLATFORM_ADMIN')).toBe(true)
  })

  it('returns false for LANDLORD', () => {
    expect(isPlatformAdmin('LANDLORD')).toBe(false)
  })

  it('returns false for TENANT', () => {
    expect(isPlatformAdmin('TENANT')).toBe(false)
  })
})

describe('getRoleLabel', () => {
  it('returns "Platform Admin" for PLATFORM_ADMIN', () => {
    expect(getRoleLabel('PLATFORM_ADMIN')).toBe('Platform Admin')
  })

  it('returns "Landlord" for LANDLORD', () => {
    expect(getRoleLabel('LANDLORD')).toBe('Landlord')
  })

  it('returns "Tenant" for TENANT', () => {
    expect(getRoleLabel('TENANT')).toBe('Tenant')
  })

  it('returns the raw string for an unknown role', () => {
    expect(getRoleLabel('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE')
  })
})

describe('getStatusColor', () => {
  it('returns green classes for ACTIVE', () => {
    expect(getStatusColor('ACTIVE')).toBe('bg-green-100 text-green-800')
  })

  it('returns gray classes for INACTIVE', () => {
    expect(getStatusColor('INACTIVE')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns red classes for SUSPENDED', () => {
    expect(getStatusColor('SUSPENDED')).toBe('bg-red-100 text-red-800')
  })

  it('returns yellow classes for PENDING', () => {
    expect(getStatusColor('PENDING')).toBe('bg-yellow-100 text-yellow-800')
  })

  it('returns green classes for AVAILABLE', () => {
    expect(getStatusColor('AVAILABLE')).toBe('bg-green-100 text-green-800')
  })

  it('returns blue classes for OCCUPIED', () => {
    expect(getStatusColor('OCCUPIED')).toBe('bg-blue-100 text-blue-800')
  })

  it('returns orange classes for MAINTENANCE', () => {
    expect(getStatusColor('MAINTENANCE')).toBe('bg-orange-100 text-orange-800')
  })

  it('returns purple classes for RESERVED', () => {
    expect(getStatusColor('RESERVED')).toBe('bg-purple-100 text-purple-800')
  })

  it('returns red classes for EXPIRED', () => {
    expect(getStatusColor('EXPIRED')).toBe('bg-red-100 text-red-800')
  })

  it('returns red classes for TERMINATED', () => {
    expect(getStatusColor('TERMINATED')).toBe('bg-red-100 text-red-800')
  })

  it('returns blue classes for RENEWED', () => {
    expect(getStatusColor('RENEWED')).toBe('bg-blue-100 text-blue-800')
  })

  it('returns yellow classes for OPEN', () => {
    expect(getStatusColor('OPEN')).toBe('bg-yellow-100 text-yellow-800')
  })

  it('returns blue classes for IN_PROGRESS', () => {
    expect(getStatusColor('IN_PROGRESS')).toBe('bg-blue-100 text-blue-800')
  })

  it('returns green classes for RESOLVED', () => {
    expect(getStatusColor('RESOLVED')).toBe('bg-green-100 text-green-800')
  })

  it('returns gray classes for CLOSED', () => {
    expect(getStatusColor('CLOSED')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns green classes for APPROVED', () => {
    expect(getStatusColor('APPROVED')).toBe('bg-green-100 text-green-800')
  })

  it('returns red classes for REJECTED', () => {
    expect(getStatusColor('REJECTED')).toBe('bg-red-100 text-red-800')
  })

  it('returns red classes for URGENT', () => {
    expect(getStatusColor('URGENT')).toBe('bg-red-100 text-red-800')
  })

  it('returns orange classes for HIGH', () => {
    expect(getStatusColor('HIGH')).toBe('bg-orange-100 text-orange-800')
  })

  it('returns yellow classes for MEDIUM', () => {
    expect(getStatusColor('MEDIUM')).toBe('bg-yellow-100 text-yellow-800')
  })

  it('returns green classes for LOW', () => {
    expect(getStatusColor('LOW')).toBe('bg-green-100 text-green-800')
  })

  it('returns default gray classes for an unknown status', () => {
    expect(getStatusColor('NONEXISTENT')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns default gray classes for an empty string', () => {
    expect(getStatusColor('')).toBe('bg-gray-100 text-gray-800')
  })
})
