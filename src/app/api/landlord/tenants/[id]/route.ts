import { NextRequest, NextResponse } from 'next/server'
import { requireLandlord } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireLandlord()
    const { id } = await params

    const tenant = await prisma.user.findFirst({
      where: { id, assignedLandlordId: user.id, role: 'TENANT' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        leases: {
          include: {
            unit: {
              select: {
                id: true,
                number: true,
                property: { select: { id: true, name: true } },
              },
            },
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 5,
            },
          },
          orderBy: { startDate: 'desc' },
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
        userDocuments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            fileName: true,
            fileSize: true,
            url: true,
            createdAt: true,
          },
        },
        _count: {
          select: { leases: true, maintenanceRequests: true, userDocuments: true },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: tenant })
  } catch (error) {
    return apiError(error)
  }
}
