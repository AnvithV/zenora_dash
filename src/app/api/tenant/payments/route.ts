import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { apiError, clampPageSize } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const paymentInclude = {
  lease: {
    include: {
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

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (user.role !== 'TENANT') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const orgId = user.organizationId
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    const { searchParams } = req.nextUrl
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    const pageSize = clampPageSize(searchParams.get('pageSize'))
    const status = searchParams.get('status')

    const where: Prisma.PaymentWhereInput = {
      lease: { tenantId: user.id },
      organizationId: orgId,
      ...(status && { status: status as Prisma.EnumPaymentStatusFilter }),
    }

    const [items, total, totalDueAgg, totalPaidAgg, nextPayment] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy: { dueDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where: { lease: { tenantId: user.id }, organizationId: orgId, status: 'PENDING', paidAt: null },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { lease: { tenantId: user.id }, organizationId: orgId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.findFirst({
        where: { lease: { tenantId: user.id }, organizationId: orgId, status: 'PENDING', paidAt: null },
        orderBy: { dueDate: 'asc' },
        select: { id: true, amount: true, dueDate: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        totalDue: totalDueAgg._sum.amount ?? 0,
        totalPaid: totalPaidAgg._sum.amount ?? 0,
        nextPayment,
      },
    })
  } catch (error) {
    return apiError(error)
  }
}
