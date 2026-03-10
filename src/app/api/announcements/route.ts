import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdminRole } from '@/lib/auth-utils'
import { announcementService } from '@/server/services/announcement.service'
import { createAnnouncementSchema } from '@/lib/validations/announcement'
import { apiError, clampPageSize } from '@/lib/api-utils'
import type { UserRole } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const result = await announcementService.list({
      organizationId: orgId,
      search: searchParams.get('search') ?? undefined,
      propertyId: searchParams.get('propertyId') ?? undefined,
      targetRole: isAdminRole(user.role) ? undefined : user.role as UserRole,
      activeOnly: !isAdminRole(user.role),
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
    if (!isAdminRole(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = createAnnouncementSchema.parse(body)
    const announcement = await announcementService.create(data, orgId, user.id)

    return NextResponse.json({ success: true, data: announcement }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
