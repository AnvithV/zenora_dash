import { NextRequest, NextResponse } from 'next/server'
import { requireLandlord } from '@/lib/auth-utils'
import { apiError, clampPageSize } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const user = await requireLandlord()
    const { searchParams } = req.nextUrl
    const page = Number(searchParams.get('page')) || 1
    const pageSize = clampPageSize(searchParams.get('pageSize'))
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const where: Prisma.UserWhereInput = {
      assignedLandlordId: user.id,
      role: 'TENANT',
      ...(status && { status: status as Prisma.EnumUserStatusFilter }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          status: true,
          createdAt: true,
          leases: {
            where: { status: 'ACTIVE' },
            take: 1,
            include: {
              unit: {
                select: {
                  number: true,
                  property: { select: { name: true } },
                },
              },
            },
          },
          _count: {
            select: { leases: true, maintenanceRequests: true },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    return apiError(error)
  }
}
