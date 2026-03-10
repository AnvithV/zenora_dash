import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type MaintenanceFilters = {
  organizationId: string
  requesterId?: string
  assigneeId?: string
  propertyId?: string
  unitId?: string
  status?: string
  priority?: string
  category?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const maintenanceRepository = {
  async findMany(filters: MaintenanceFilters) {
    const {
      organizationId, requesterId, assigneeId, propertyId, unitId,
      status, priority, category, search,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.MaintenanceRequestWhereInput = {
      organizationId,
      ...(requesterId && { requesterId }),
      ...(assigneeId && { assigneeId }),
      ...(propertyId && { propertyId }),
      ...(unitId && { unitId }),
      ...(status && { status: status as Prisma.EnumMaintenanceStatusFilter['equals'] }),
      ...(priority && { priority: priority as Prisma.EnumMaintenancePriorityFilter['equals'] }),
      ...(category && { category: category as Prisma.EnumMaintenanceCategoryFilter['equals'] }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          property: { select: { id: true, name: true } },
          unit: { select: { id: true, number: true } },
          requester: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
          _count: { select: { comments: true, documents: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.maintenanceRequest.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.maintenanceRequest.findFirst({
      where: { id, organizationId },
      include: {
        property: { select: { id: true, name: true, address: true } },
        unit: { select: { id: true, number: true } },
        requester: { select: { id: true, name: true, email: true, image: true } },
        assignee: { select: { id: true, name: true, email: true, image: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        documents: true,
      },
    })
  },

  async create(data: Prisma.MaintenanceRequestCreateInput) {
    return prisma.maintenanceRequest.create({
      data,
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, number: true } },
        requester: { select: { id: true, name: true } },
      },
    })
  },

  async update(id: string, data: Prisma.MaintenanceRequestUpdateInput) {
    return prisma.maintenanceRequest.update({
      where: { id },
      data,
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, number: true } },
        requester: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    })
  },

  async delete(id: string) {
    return prisma.maintenanceRequest.delete({ where: { id } })
  },

  async addComment(data: Prisma.MaintenanceCommentCreateInput) {
    return prisma.maintenanceComment.create({
      data,
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    })
  },

  async getStats(organizationId: string) {
    const [total, open, inProgress, resolved] = await Promise.all([
      prisma.maintenanceRequest.count({ where: { organizationId } }),
      prisma.maintenanceRequest.count({ where: { organizationId, status: 'OPEN' } }),
      prisma.maintenanceRequest.count({ where: { organizationId, status: 'IN_PROGRESS' } }),
      prisma.maintenanceRequest.count({ where: { organizationId, status: 'RESOLVED' } }),
    ])

    const urgent = await prisma.maintenanceRequest.count({
      where: { organizationId, priority: 'URGENT', status: { in: ['OPEN', 'IN_PROGRESS'] } },
    })

    return { total, open, inProgress, resolved, urgent }
  },
}
