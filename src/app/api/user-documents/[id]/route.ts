import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin, isAdminRole } from '@/lib/auth-utils'
import { userDocumentService } from '@/server/services/user-document.service'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const doc = await userDocumentService.getById(id, orgId)

    // Non-admin can only view their own documents
    if (!isAdminRole(user.role) && doc.user.id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: doc })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const admin = await requireAdmin()
    const orgId = admin.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    await userDocumentService.delete(id, orgId, admin.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
