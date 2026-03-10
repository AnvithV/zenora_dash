import { prisma } from '@/lib/prisma'
import type { Prisma, UserRole } from '@prisma/client'

export type AnnouncementFilters = {
  organizationId: string
  propertyId?: string
  targetRole?: UserRole
  search?: string
  activeOnly?: boolean
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const announcementRepository = {
  async findMany(filters: AnnouncementFilters) {
    const {
      organizationId, propertyId, targetRole, search, activeOnly,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const now = new Date()
    const where: Prisma.AnnouncementWhereInput = {
      organizationId,
      ...(propertyId && { propertyId }),
      ...(targetRole && { targetRoles: { has: targetRole } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(activeOnly && {
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: now } },
        ],
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          property: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.announcement.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.announcement.findFirst({
      where: { id, organizationId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true } },
      },
    })
  },

  async create(data: Prisma.AnnouncementCreateInput) {
    return prisma.announcement.create({
      data,
      include: {
        author: { select: { id: true, name: true } },
      },
    })
  },

  async update(id: string, data: Prisma.AnnouncementUpdateInput) {
    return prisma.announcement.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true } },
      },
    })
  },

  async delete(id: string) {
    return prisma.announcement.delete({ where: { id } })
  },
}
