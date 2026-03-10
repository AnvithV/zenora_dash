import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { unitService } from '@/server/services/unit.service'
import { createUnitSchema } from '@/lib/validations/unit'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const result = await unitService.list({
      organizationId: orgId,
      propertyId: searchParams.get('propertyId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
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
    const data = createUnitSchema.parse(body)
    const unit = await unitService.create(data, orgId, user.id)

    return NextResponse.json({ success: true, data: unit }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
