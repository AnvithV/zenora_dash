import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type UserFilters = {
  organizationId?: string
  search?: string
  role?: string
  status?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const userRepository = {
  async findMany(filters: UserFilters) {
    const {
      organizationId, search, role, status,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.UserWhereInput = {
      ...(organizationId && {
        memberships: { some: { organizationId } },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role: role as Prisma.EnumUserRoleFilter['equals'] }),
      ...(status && { status: status as Prisma.EnumUserStatusFilter['equals'] }),
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: { leases: true, maintenanceRequests: true, ownedProperties: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: { organization: { select: { id: true, name: true } } },
        },
        ownedProperties: { select: { id: true, name: true } },
        managedProperties: { select: { id: true, name: true } },
        leases: {
          include: {
            unit: {
              select: { id: true, number: true, property: { select: { id: true, name: true } } },
            },
          },
          orderBy: { startDate: 'desc' },
          take: 5,
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            leases: true,
            maintenanceRequests: true,
            ownedProperties: true,
            managedProperties: true,
          },
        },
      },
    })
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    })
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  },

  async getStats(organizationId?: string) {
    const where: Prisma.UserWhereInput = organizationId
      ? { memberships: { some: { organizationId } } }
      : {}

    const [total, byRole, byStatus] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ['role'],
        where,
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ])

    return { total, byRole, byStatus }
  },
}
