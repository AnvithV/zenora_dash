import { auth } from '@/lib/auth'
import { type UserRole } from '@prisma/client'

const ADMIN_ROLES: UserRole[] = ['PLATFORM_ADMIN', 'LANDLORD']

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (!isAdminRole(user.role)) throw new Error('Forbidden')
  return user
}

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role)
}

export function isPlatformAdmin(role: UserRole): boolean {
  return role === 'PLATFORM_ADMIN'
}

export function getRoleLabel(role: UserRole | string): string {
  const labels: Record<string, string> = {
    PLATFORM_ADMIN: 'Platform Admin',
    LANDLORD: 'Landlord',
    TENANT: 'Tenant',
  }
  return labels[role] ?? role
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    OCCUPIED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800',
    RESERVED: 'bg-purple-100 text-purple-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    EXPIRED: 'bg-red-100 text-red-800',
    TERMINATED: 'bg-red-100 text-red-800',
    RENEWED: 'bg-blue-100 text-blue-800',
    OPEN: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}
