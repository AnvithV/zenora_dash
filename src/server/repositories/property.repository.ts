import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type PropertyFilters = {
  organizationId: string
  search?: string
  type?: string
  status?: string
  ownerId?: string
  managerId?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const propertyRepository = {
  async findMany(filters: PropertyFilters) {
    const {
      organizationId, search, type, status, ownerId, managerId,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.PropertyWhereInput = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(type && { type: type as Prisma.EnumPropertyTypeFilter['equals'] }),
      ...(status && { status: status as Prisma.EnumPropertyStatusFilter['equals'] }),
      ...(ownerId && { ownerId }),
      ...(managerId && { managerId }),
    }

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          manager: { select: { id: true, name: true, email: true } },
          _count: { select: { units: true, maintenance: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.property.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.property.findFirst({
      where: { id, organizationId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        units: {
          include: {
            _count: { select: { leases: true, maintenance: true } },
          },
          orderBy: { number: 'asc' },
        },
        _count: { select: { units: true, maintenance: true, documents: true } },
      },
    })
  },

  async create(data: Prisma.PropertyCreateInput) {
    return prisma.property.create({
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    })
  },

  async update(id: string, organizationId: string, data: Prisma.PropertyUpdateInput) {
    return prisma.property.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    })
  },

  async delete(id: string, organizationId: string) {
    return prisma.property.delete({ where: { id, organizationId } })
  },

  async getStats(organizationId: string) {
    const [total, active, byType] = await Promise.all([
      prisma.property.count({ where: { organizationId } }),
      prisma.property.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.property.groupBy({
        by: ['type'],
        where: { organizationId },
        _count: true,
      }),
    ])

    return { total, active, byType }
  },
}
