import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdminRole } from '@/lib/auth-utils'
import { documentRepository } from '@/server/repositories/document.repository'
import { deleteFile } from '@/lib/file-storage'
import { apiError } from '@/lib/api-utils'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const document = await documentRepository.findById(id, orgId)
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })

    if (!isAdminRole(user.role) && document.uploadedById !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const document = await documentRepository.findById(id, orgId)
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })

    if (!isAdminRole(user.role) && document.uploadedById !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await documentRepository.delete(id)
    await deleteFile(document.url).catch(() => {})
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
