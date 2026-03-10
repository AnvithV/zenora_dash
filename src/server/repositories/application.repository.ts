import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type ApplicationFilters = {
  organizationId: string
  applicantId?: string
  propertyId?: string
  unitId?: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const applicationRepository = {
  async findMany(filters: ApplicationFilters) {
    const {
      organizationId, applicantId, propertyId, unitId, status, search,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = filters

    const where: Prisma.ApplicationWhereInput = {
      organizationId,
      ...(applicantId && { applicantId }),
      ...(propertyId && { propertyId }),
      ...(unitId && { unitId }),
      ...(status && { status: status as Prisma.EnumApplicationStatusFilter['equals'] }),
      ...(search && {
        OR: [
          { applicant: { name: { contains: search, mode: 'insensitive' } } },
          { applicant: { email: { contains: search, mode: 'insensitive' } } },
          { unit: { number: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicant: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, name: true } },
          unit: { select: { id: true, number: true } },
          _count: { select: { documents: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.application.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string, organizationId: string) {
    return prisma.application.findFirst({
      where: { id, organizationId },
      include: {
        applicant: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, name: true, address: true } },
        unit: { select: { id: true, number: true, rent: true, bedrooms: true, bathrooms: true } },
        documents: true,
      },
    })
  },

  async create(data: Prisma.ApplicationCreateInput) {
    return prisma.application.create({
      data,
      include: {
        applicant: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, number: true } },
      },
    })
  },

  async update(id: string, data: Prisma.ApplicationUpdateInput) {
    return prisma.application.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return prisma.application.delete({ where: { id } })
  },

  async getStats(organizationId: string) {
    const [total, submitted, underReview, approved, rejected] = await Promise.all([
      prisma.application.count({ where: { organizationId } }),
      prisma.application.count({ where: { organizationId, status: 'SUBMITTED' } }),
      prisma.application.count({ where: { organizationId, status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { organizationId, status: 'APPROVED' } }),
      prisma.application.count({ where: { organizationId, status: 'REJECTED' } }),
    ])

    return { total, submitted, underReview, approved, rejected }
  },
}
