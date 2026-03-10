import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin, isAdminRole } from '@/lib/auth-utils'
import { leaseService } from '@/server/services/lease.service'
import { createLeaseSchema } from '@/lib/validations/lease'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const result = await leaseService.list({
      organizationId: orgId,
      ...(!isAdminRole(user.role) && { tenantId: user.id }),
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      propertyId: searchParams.get('propertyId') ?? undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: clampPageSize(searchParams.get('pageSize')),
      sortBy: searchParams.get('sortBy') ?? 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = createLeaseSchema.parse(body)
    const lease = await leaseService.create(data, orgId, user.id)

    return NextResponse.json({ success: true, data: lease }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
