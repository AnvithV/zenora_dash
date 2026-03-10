import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdminRole } from '@/lib/auth-utils'
import { maintenanceService } from '@/server/services/maintenance.service'
import { updateMaintenanceSchema } from '@/lib/validations/maintenance'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const request = await maintenanceService.getById(id, orgId, {
      filterInternalComments: !isAdminRole(user.role),
    })
    if (!isAdminRole(user.role) && request.requesterId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ success: true, data: request })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const existing = await maintenanceService.getById(id, orgId)
    if (!isAdminRole(user.role) && existing.requesterId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const data = updateMaintenanceSchema.parse(body)
    const request = await maintenanceService.update(id, data, orgId, user.id)

    return NextResponse.json({ success: true, data: request })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const existing = await maintenanceService.getById(id, orgId)
    if (!isAdminRole(user.role) && existing.requesterId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await maintenanceService.delete(id, orgId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
