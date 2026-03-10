import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { propertyRepository } from '@/server/repositories/property.repository'
import { unitRepository } from '@/server/repositories/unit.repository'
import { leaseRepository } from '@/server/repositories/lease.repository'
import { maintenanceRepository } from '@/server/repositories/maintenance.repository'
import { applicationRepository } from '@/server/repositories/application.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import { userRepository } from '@/server/repositories/user.repository'
import { apiError } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    const [properties, units, leases, maintenance, applications, recentActivity, users] = await Promise.all([
      propertyRepository.getStats(orgId),
      unitRepository.getStats(orgId),
      leaseRepository.getStats(orgId),
      maintenanceRepository.getStats(orgId),
      applicationRepository.getStats(orgId),
      auditRepository.getRecent(orgId, 10),
      userRepository.getStats(orgId),
    ])

    return NextResponse.json({
      success: true,
      data: { properties, units, leases, maintenance, applications, recentActivity, users },
    })
  } catch (error) {
    return apiError(error)
  }
}
