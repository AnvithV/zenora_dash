import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin, isAdminRole } from '@/lib/auth-utils'
import { userDocumentService } from '@/server/services/user-document.service'
import { createUserDocumentSchema } from '@/lib/validations/user-document'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const result = await userDocumentService.list({
      organizationId: orgId,
      search: searchParams.get('search') ?? undefined,
      // Admin can filter by userId; non-admin only sees their own
      userId: isAdminRole(user.role)
        ? (searchParams.get('userId') ?? undefined)
        : user.id,
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
    const admin = await requireAdmin()
    const orgId = admin.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = createUserDocumentSchema.parse(body)

    const doc = await userDocumentService.create(data, orgId, admin.id)

    return NextResponse.json({ success: true, data: doc }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
