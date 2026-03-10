import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { maintenanceService } from '@/server/services/maintenance.service'
import { createCommentSchema } from '@/lib/validations/maintenance'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = createCommentSchema.parse(body)
    const comment = await maintenanceService.addComment(id, data, orgId, user.id)

    return NextResponse.json({ success: true, data: comment }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
