import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type UserDocumentFilters = {
  organizationId: string
  userId?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const userDocumentRepository = {
  async findMany(filters: UserDocumentFilters) {
    const {
      organizationId, userId, search,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.UserDocumentWhereInput = {
      organizationId,
      ...(userId && { userId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.userDocument.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          uploadedBy: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.userDocument.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.userDocument.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    })
  },

  async create(data: Prisma.UserDocumentCreateInput) {
    return prisma.userDocument.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
    })
  },

  async delete(id: string) {
    return prisma.userDocument.delete({ where: { id } })
  },
}
