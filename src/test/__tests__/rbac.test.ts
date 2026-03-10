import { describe, it, expect, vi } from 'vitest'

// Mock the auth module to avoid importing next-auth/next/server in test environment
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import {
  isAdminRole,
  isPlatformAdmin,
  canManageProperty,
  canViewAdminDashboard,
  getRoleLabel,
} from '@/lib/auth-utils'

describe('RBAC - Platform Admin Permissions', () => {
  it('has full admin access', () => {
    expect(isAdminRole('PLATFORM_ADMIN')).toBe(true)
    expect(isPlatformAdmin('PLATFORM_ADMIN')).toBe(true)
    expect(canManageProperty('PLATFORM_ADMIN')).toBe(true)
    expect(canViewAdminDashboard('PLATFORM_ADMIN')).toBe(true)
  })

  it('is recognized as platform admin', () => {
    expect(isPlatformAdmin('PLATFORM_ADMIN')).toBe(true)
  })

  it('has the correct role label', () => {
    expect(getRoleLabel('PLATFORM_ADMIN')).toBe('Platform Admin')
  })
})

describe('RBAC - Landlord Permissions', () => {
  it('has limited admin access', () => {
    expect(isAdminRole('LANDLORD')).toBe(true)
    expect(isPlatformAdmin('LANDLORD')).toBe(false)
    expect(canManageProperty('LANDLORD')).toBe(true)
    expect(canViewAdminDashboard('LANDLORD')).toBe(true)
  })

  it('is not a platform admin', () => {
    expect(isPlatformAdmin('LANDLORD')).toBe(false)
  })

  it('can manage properties', () => {
    expect(canManageProperty('LANDLORD')).toBe(true)
  })

  it('can view the admin dashboard', () => {
    expect(canViewAdminDashboard('LANDLORD')).toBe(true)
  })

  it('has the correct role label', () => {
    expect(getRoleLabel('LANDLORD')).toBe('Landlord')
  })
})

describe('RBAC - Tenant Permissions', () => {
  it('has no admin access', () => {
    expect(isAdminRole('TENANT')).toBe(false)
    expect(isPlatformAdmin('TENANT')).toBe(false)
    expect(canManageProperty('TENANT')).toBe(false)
    expect(canViewAdminDashboard('TENANT')).toBe(false)
  })

  it('is not an admin role', () => {
    expect(isAdminRole('TENANT')).toBe(false)
  })

  it('is not a platform admin', () => {
    expect(isPlatformAdmin('TENANT')).toBe(false)
  })

  it('cannot manage properties', () => {
    expect(canManageProperty('TENANT')).toBe(false)
  })

  it('cannot view the admin dashboard', () => {
    expect(canViewAdminDashboard('TENANT')).toBe(false)
  })

  it('has the correct role label', () => {
    expect(getRoleLabel('TENANT')).toBe('Tenant')
  })
})

describe('RBAC - Role Hierarchy', () => {
  it('Platform Admin is above Landlord (has isPlatformAdmin, Landlord does not)', () => {
    expect(isPlatformAdmin('PLATFORM_ADMIN')).toBe(true)
    expect(isPlatformAdmin('LANDLORD')).toBe(false)
  })

  it('both Platform Admin and Landlord are admin roles', () => {
    expect(isAdminRole('PLATFORM_ADMIN')).toBe(true)
    expect(isAdminRole('LANDLORD')).toBe(true)
  })

  it('Tenant is below both admin roles', () => {
    expect(isAdminRole('TENANT')).toBe(false)
    expect(canManageProperty('TENANT')).toBe(false)
    expect(canViewAdminDashboard('TENANT')).toBe(false)
  })

  it('only three valid roles exist in the label map', () => {
    expect(getRoleLabel('PLATFORM_ADMIN')).toBe('Platform Admin')
    expect(getRoleLabel('LANDLORD')).toBe('Landlord')
    expect(getRoleLabel('TENANT')).toBe('Tenant')
    // Unknown roles fall back to raw string
    expect(getRoleLabel('SUPER_ADMIN')).toBe('SUPER_ADMIN')
    expect(getRoleLabel('APPLICANT')).toBe('APPLICANT')
    expect(getRoleLabel('VENDOR')).toBe('VENDOR')
    expect(getRoleLabel('PROPERTY_MANAGER')).toBe('PROPERTY_MANAGER')
  })
})

describe('RBAC - Removed Roles Are Not Recognized', () => {
  it('SUPER_ADMIN is not recognized as admin', () => {
    // @ts-expect-error testing removed role
    expect(isAdminRole('SUPER_ADMIN')).toBe(false)
    // @ts-expect-error testing removed role
    expect(isPlatformAdmin('SUPER_ADMIN')).toBe(false)
  })

  it('APPLICANT is not recognized as admin', () => {
    // @ts-expect-error testing removed role
    expect(isAdminRole('APPLICANT')).toBe(false)
    // @ts-expect-error testing removed role
    expect(canManageProperty('APPLICANT')).toBe(false)
  })

  it('VENDOR is not recognized as admin', () => {
    // @ts-expect-error testing removed role
    expect(isAdminRole('VENDOR')).toBe(false)
    // @ts-expect-error testing removed role
    expect(canViewAdminDashboard('VENDOR')).toBe(false)
  })

  it('PROPERTY_MANAGER is not recognized as admin', () => {
    // @ts-expect-error testing removed role
    expect(isAdminRole('PROPERTY_MANAGER')).toBe(false)
    // @ts-expect-error testing removed role
    expect(isPlatformAdmin('PROPERTY_MANAGER')).toBe(false)
  })
})
