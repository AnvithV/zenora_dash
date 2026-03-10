import { NextResponse } from 'next/server'
import { requireLandlord } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await requireLandlord()

    const leases = await prisma.lease.findMany({
      where: {
        tenant: { assignedLandlordId: user.id },
        status: { in: ['ACTIVE', 'DRAFT', 'PENDING'] },
      },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        unit: {
          select: {
            id: true,
            number: true,
            property: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({ success: true, data: leases })
  } catch (error) {
    return apiError(error)
  }
}
