import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdminRole } from '@/lib/auth-utils'
import { maintenanceService } from '@/server/services/maintenance.service'
import { createMaintenanceSchema } from '@/lib/validations/maintenance'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const filters = {
      organizationId: orgId,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      priority: searchParams.get('priority') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      propertyId: searchParams.get('propertyId') ?? undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: clampPageSize(searchParams.get('pageSize')),
      sortBy: searchParams.get('sortBy') ?? 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
      // Tenants can only see their own requests
      ...(!isAdminRole(user.role) && { requesterId: user.id }),
    }

    const result = await maintenanceService.list(filters)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = createMaintenanceSchema.parse(body)
    const request = await maintenanceService.create(data, orgId, user.id)

    return NextResponse.json({ success: true, data: request }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
