import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { announcementService } from '@/server/services/announcement.service'
import { updateAnnouncementSchema } from '@/lib/validations/announcement'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAdmin()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const announcement = await announcementService.getById(id, orgId)
    return NextResponse.json({ success: true, data: announcement })
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
    const data = updateAnnouncementSchema.parse(body)
    const announcement = await announcementService.update(id, data, orgId, user.id)

    return NextResponse.json({ success: true, data: announcement })
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

    await announcementService.delete(id, orgId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
