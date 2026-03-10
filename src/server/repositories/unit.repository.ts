import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type UnitFilters = {
  organizationId: string
  propertyId?: string
  search?: string
  status?: string
  minRent?: number
  maxRent?: number
  bedrooms?: number
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const unitRepository = {
  async findMany(filters: UnitFilters) {
    const {
      organizationId, propertyId, search, status, minRent, maxRent, bedrooms,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.UnitWhereInput = {
      property: { organizationId },
      ...(propertyId && { propertyId }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: 'insensitive' } },
          { property: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(status && { status: status as Prisma.EnumUnitStatusFilter['equals'] }),
      ...(minRent !== undefined && { rent: { gte: minRent } }),
      ...(maxRent !== undefined && { rent: { lte: maxRent } }),
      ...(bedrooms !== undefined && { bedrooms }),
    }

    const [items, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        include: {
          property: { select: { id: true, name: true, address: true } },
          _count: { select: { leases: true, maintenance: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.unit.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.unit.findFirst({
      where: { id, property: { organizationId } },
      include: {
        property: { select: { id: true, name: true, address: true, organizationId: true } },
        leases: {
          include: {
            tenant: { select: { id: true, name: true, email: true } },
          },
          orderBy: { startDate: 'desc' },
        },
        maintenance: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { leases: true, maintenance: true } },
      },
    })
  },

  async create(data: Prisma.UnitCreateInput) {
    return prisma.unit.create({
      data,
      include: {
        property: { select: { id: true, name: true } },
      },
    })
  },

  async update(id: string, data: Prisma.UnitUpdateInput) {
    return prisma.unit.update({
      where: { id },
      data,
      include: {
        property: { select: { id: true, name: true } },
      },
    })
  },

  async delete(id: string) {
    return prisma.unit.delete({ where: { id } })
  },

  async getStats(organizationId: string) {
    const [total, available, occupied, maintenance] = await Promise.all([
      prisma.unit.count({ where: { property: { organizationId } } }),
      prisma.unit.count({ where: { property: { organizationId }, status: 'AVAILABLE' } }),
      prisma.unit.count({ where: { property: { organizationId }, status: 'OCCUPIED' } }),
      prisma.unit.count({ where: { property: { organizationId }, status: 'MAINTENANCE' } }),
    ])

    return {
      total,
      available,
      occupied,
      maintenance,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    }
  },
}
