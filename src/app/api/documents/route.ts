import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, isAdminRole } from '@/lib/auth-utils'
import { documentRepository } from '@/server/repositories/document.repository'
import { apiError, clampPageSize } from '@/lib/api-utils'

const createDocumentSchema = z.object({
  name: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  url: z.string().min(1),
  type: z.enum(['LEASE_AGREEMENT', 'ID_DOCUMENT', 'PROOF_OF_INCOME', 'INSURANCE', 'INSPECTION_REPORT', 'MAINTENANCE_PHOTO', 'OTHER']).optional().default('OTHER'),
  propertyId: z.string().optional(),
  leaseId: z.string().optional(),
  requestId: z.string().optional(),
  applicationId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { searchParams } = req.nextUrl
    const result = await documentRepository.findMany({
      organizationId: orgId,
      search: searchParams.get('search') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      propertyId: searchParams.get('propertyId') ?? undefined,
      leaseId: searchParams.get('leaseId') ?? undefined,
      ...(!isAdminRole(user.role) && { uploadedById: user.id }),
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
    const data = createDocumentSchema.parse(body)
    const document = await documentRepository.create({
      name: data.name,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      url: data.url,
      type: data.type,
      organization: { connect: { id: orgId } },
      uploadedBy: { connect: { id: user.id } },
      ...(data.propertyId && { property: { connect: { id: data.propertyId } } }),
      ...(data.leaseId && { lease: { connect: { id: data.leaseId } } }),
      ...(data.requestId && { request: { connect: { id: data.requestId } } }),
      ...(data.applicationId && { application: { connect: { id: data.applicationId } } }),
    })

    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
