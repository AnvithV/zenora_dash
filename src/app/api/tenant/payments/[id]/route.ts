import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/server/services/notification.service'
import { auditRepository } from '@/server/repositories/audit.repository'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireAuth()
    if (user.role !== 'TENANT') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const orgId = user.organizationId
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { lease: { include: { tenant: { select: { id: true, name: true, assignedLandlordId: true } } } } },
    })

    if (!payment || payment.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }

    if (payment.lease.tenantId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    if (!body.markPaid) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    if (payment.status !== 'PENDING' || payment.paidAt) {
      return NextResponse.json({ success: false, error: 'Payment cannot be marked as paid' }, { status: 400 })
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { paidAt: new Date() },
      include: {
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
      },
    })

    // Audit log
    await auditRepository.create({
      action: 'payment.marked_paid',
      entityType: 'Payment',
      entityId: id,
      userId: user.id,
      organizationId: orgId,
      metadata: { amount: payment.amount },
    })

    // Notify assigned landlord
    const landlordId = payment.lease.tenant.assignedLandlordId
    if (landlordId) {
      await notificationService.notify({
        type: 'PAYMENT',
        title: 'Payment Marked as Paid',
        message: `${user.name ?? 'A tenant'} marked a payment of $${payment.amount.toFixed(2)} as paid. Please verify.`,
        link: `/landlord/payments`,
        userId: landlordId,
        organizationId: orgId,
      })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return apiError(error)
  }
}
