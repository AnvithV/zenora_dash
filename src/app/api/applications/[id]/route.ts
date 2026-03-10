import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdminRole } from '@/lib/auth-utils'
import { applicationService } from '@/server/services/application.service'
import { reviewApplicationSchema } from '@/lib/validations/application'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const application = await applicationService.getById(id, orgId)
    if (!isAdminRole(user.role) && application.applicantId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()

    // Withdraw action (for applicants)
    if (body.action === 'withdraw') {
      const application = await applicationService.withdraw(id, orgId, user.id)
      return NextResponse.json({ success: true, data: application })
    }

    // Review action (for admins)
    if (!isAdminRole(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const data = reviewApplicationSchema.parse(body)
    const application = await applicationService.review(id, data, orgId, user.id)

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    return apiError(error)
  }
}
