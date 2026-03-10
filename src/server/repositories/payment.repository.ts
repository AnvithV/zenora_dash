import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type PaymentFilters = {
  landlordId: string
  status?: string
  page?: number
  pageSize?: number
  sortOrder?: 'asc' | 'desc'
}

const paymentInclude = {
  lease: {
    include: {
      tenant: { select: { id: true, name: true, email: true, image: true, assignedLandlordId: true } },
      unit: {
        select: {
          id: true,
          number: true,
          property: { select: { id: true, name: true } },
        },
      },
    },
  },
}

export const paymentRepository = {
  async findMany(filters: PaymentFilters) {
    const { landlordId, status, page = 1, pageSize = 10, sortOrder = 'desc' } = filters

    const where: Prisma.PaymentWhereInput = {
      lease: { tenant: { assignedLandlordId: landlordId } },
      ...(status && { status: status as Prisma.EnumPaymentStatusFilter }),
    }

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy: { dueDate: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: paymentInclude,
    })
  },

  async create(data: Prisma.PaymentCreateInput) {
    return prisma.payment.create({ data, include: paymentInclude })
  },

  async update(id: string, data: Prisma.PaymentUpdateInput) {
    return prisma.payment.update({ where: { id }, data, include: paymentInclude })
  },

  async delete(id: string) {
    return prisma.payment.delete({ where: { id } })
  },

  async getStats(landlordId: string) {
    const where: Prisma.PaymentWhereInput = {
      lease: { tenant: { assignedLandlordId: landlordId } },
    }

    const [totalCollected, pending, overdue] = await Promise.all([
      prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { ...where, status: 'PENDING', dueDate: { lt: new Date() } },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    return {
      totalCollected: totalCollected._sum.amount ?? 0,
      totalCollectedCount: totalCollected._count,
      pendingAmount: pending._sum.amount ?? 0,
      pendingCount: pending._count,
      overdueAmount: overdue._sum.amount ?? 0,
      overdueCount: overdue._count,
    }
  },
}
