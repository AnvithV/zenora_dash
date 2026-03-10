import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { auditRepository } from '@/server/repositories/audit.repository'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const result = await auditRepository.findMany({
      organizationId: orgId,
      action: searchParams.get('action') ?? undefined,
      entityType: searchParams.get('entityType') ?? undefined,
      userId: searchParams.get('userId') ?? undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: clampPageSize(searchParams.get('pageSize'), 20),
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return apiError(error)
  }
}
