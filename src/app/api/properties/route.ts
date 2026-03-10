import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { propertyService } from '@/server/services/property.service'
import { createPropertySchema } from '@/lib/validations/property'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    const { searchParams } = req.nextUrl
    const result = await propertyService.list({
      organizationId: orgId,
      search: searchParams.get('search') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: clampPageSize(searchParams.get('pageSize')),
      sortBy: searchParams.get('sortBy') ?? 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    }, user.role, user.id)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    const body = await req.json()
    const data = createPropertySchema.parse(body)
    const property = await propertyService.create(data, orgId, user.id)

    return NextResponse.json({ success: true, data: property }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
