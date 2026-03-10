import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { unitService } from '@/server/services/unit.service'
import { updateUnitSchema } from '@/lib/validations/unit'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const unit = await unitService.getById(id, orgId)
    return NextResponse.json({ success: true, data: unit })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = updateUnitSchema.parse(body)
    const unit = await unitService.update(id, data, orgId, user.id)

    return NextResponse.json({ success: true, data: unit })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    await unitService.delete(id, orgId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
