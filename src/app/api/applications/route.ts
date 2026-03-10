import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdminRole } from '@/lib/auth-utils'
import { applicationService } from '@/server/services/application.service'
import { createApplicationSchema } from '@/lib/validations/application'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const result = await applicationService.list({
      organizationId: orgId,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      propertyId: searchParams.get('propertyId') ?? undefined,
      ...(!isAdminRole(user.role) && { applicantId: user.id }),
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
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = createApplicationSchema.parse(body)
    const application = await applicationService.create(data, orgId, user.id)

    return NextResponse.json({ success: true, data: application }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
