import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type LeaseFilters = {
  organizationId: string
  tenantId?: string
  unitId?: string
  propertyId?: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const leaseRepository = {
  async findMany(filters: LeaseFilters) {
    const {
      organizationId, tenantId, unitId, propertyId, status, search,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.LeaseWhereInput = {
      organizationId,
      ...(tenantId && { tenantId }),
      ...(unitId && { unitId }),
      ...(propertyId && { unit: { propertyId } }),
      ...(status && { status: status as Prisma.EnumLeaseStatusFilter['equals'] }),
      ...(search && {
        OR: [
          { tenant: { name: { contains: search, mode: 'insensitive' } } },
          { tenant: { email: { contains: search, mode: 'insensitive' } } },
          { unit: { number: { contains: search, mode: 'insensitive' } } },
          { unit: { property: { name: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.lease.findMany({
        where,
        include: {
          unit: {
            select: { id: true, number: true, property: { select: { id: true, name: true } } },
          },
          tenant: { select: { id: true, name: true, email: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lease.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.lease.findFirst({
      where: { id, organizationId },
      include: {
        unit: {
          include: {
            property: { select: { id: true, name: true, address: true } },
          },
        },
        tenant: { select: { id: true, name: true, email: true, phone: true } },
        previousLease: { select: { id: true, startDate: true, endDate: true, status: true } },
        renewedLease: { select: { id: true, startDate: true, endDate: true, status: true } },
        documents: true,
        payments: { orderBy: { dueDate: 'desc' } },
      },
    })
  },

  async create(data: Prisma.LeaseCreateInput) {
    return prisma.lease.create({
      data,
      include: {
        unit: { select: { id: true, number: true, property: { select: { id: true, name: true } } } },
        tenant: { select: { id: true, name: true, email: true } },
      },
    })
  },

  async update(id: string, data: Prisma.LeaseUpdateInput) {
    return prisma.lease.update({
      where: { id },
      data,
      include: {
        unit: { select: { id: true, number: true, property: { select: { id: true, name: true } } } },
        tenant: { select: { id: true, name: true, email: true } },
      },
    })
  },

  async delete(id: string) {
    return prisma.lease.delete({ where: { id } })
  },

  async checkOverlap(unitId: string, startDate: Date, endDate: Date, excludeId?: string) {
    return prisma.lease.findFirst({
      where: {
        unitId,
        status: { in: ['ACTIVE', 'PENDING'] },
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    })
  },

  async getStats(organizationId: string) {
    const [total, active, expiring, expired] = await Promise.all([
      prisma.lease.count({ where: { organizationId } }),
      prisma.lease.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.lease.count({
        where: {
          organizationId,
          status: 'ACTIVE',
          endDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
      }),
      prisma.lease.count({ where: { organizationId, status: 'EXPIRED' } }),
    ])

    return { total, active, expiring, expired }
  },
}
