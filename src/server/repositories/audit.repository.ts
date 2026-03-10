import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type AuditFilters = {
  organizationId: string
  userId?: string
  entityType?: string
  entityId?: string
  action?: string
  page?: number
  pageSize?: number
  sortOrder?: 'asc' | 'desc'
}

export const auditRepository = {
  async findMany(filters: AuditFilters) {
    const {
      organizationId, userId, entityType, entityId, action,
      page = 1, pageSize = 20, sortOrder = 'desc',
    } = filters

    const where: Prisma.AuditEventWhereInput = {
      organizationId,
      ...(userId && { userId }),
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
    }

    const [items, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditEvent.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async create(data: {
    action: string
    entityType: string
    entityId: string
    userId: string
    organizationId: string
    metadata?: Record<string, unknown>
    ipAddress?: string
  }) {
    return prisma.auditEvent.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
        user: { connect: { id: data.userId } },
        organization: { connect: { id: data.organizationId } },
      },
    })
  },

  async getRecent(organizationId: string, limit = 10) {
    return prisma.auditEvent.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },
}
