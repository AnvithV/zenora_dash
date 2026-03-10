import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type DocumentFilters = {
  organizationId: string
  propertyId?: string
  leaseId?: string
  requestId?: string
  applicationId?: string
  type?: string
  search?: string
  uploadedById?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const documentRepository = {
  async findMany(filters: DocumentFilters) {
    const {
      organizationId, propertyId, leaseId, requestId, applicationId,
      type, search, uploadedById,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.DocumentWhereInput = {
      organizationId,
      ...(propertyId && { propertyId }),
      ...(leaseId && { leaseId }),
      ...(requestId && { requestId }),
      ...(applicationId && { applicationId }),
      ...(type && { type: type as Prisma.EnumDocumentTypeFilter['equals'] }),
      ...(uploadedById && { uploadedById }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, name: true } },
          property: { select: { id: true, name: true } },
          lease: { select: { id: true } },
          request: { select: { id: true, title: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.document.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.document.findFirst({
      where: { id, organizationId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true } },
        lease: { select: { id: true } },
        request: { select: { id: true, title: true } },
        application: { select: { id: true } },
      },
    })
  },

  async create(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({ data })
  },

  async delete(id: string) {
    return prisma.document.delete({ where: { id } })
  },
}
