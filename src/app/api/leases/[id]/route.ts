import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin, isAdminRole } from '@/lib/auth-utils'
import { leaseService } from '@/server/services/lease.service'
import { updateLeaseSchema } from '@/lib/validations/lease'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const lease = await leaseService.getById(id, orgId)

    // Non-admin users can only view their own leases
    if (!isAdminRole(user.role) && lease.tenantId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: lease })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()

    // Handle special actions
    if (body.action === 'renew') {
      const lease = await leaseService.renew(id, new Date(body.newEndDate), body.newRent, orgId, user.id)
      return NextResponse.json({ success: true, data: lease })
    }

    if (body.action === 'terminate') {
      const lease = await leaseService.terminate(id, orgId, user.id)
      return NextResponse.json({ success: true, data: lease })
    }

    const data = updateLeaseSchema.parse(body)
    const lease = await leaseService.update(id, data, orgId, user.id)

    return NextResponse.json({ success: true, data: lease })
  } catch (error) {
    return apiError(error)
  }
}
