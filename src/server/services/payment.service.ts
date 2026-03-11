import { paymentRepository, type PaymentFilters } from '@/server/repositories/payment.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import { notificationService } from '@/server/services/notification.service'
import { prisma } from '@/lib/prisma'
import type { CreatePaymentInput, UpdatePaymentInput } from '@/lib/validations/payment'

export const paymentService = {
  async list(filters: PaymentFilters) {
    return paymentRepository.findMany(filters)
  },

  async getById(id: string) {
    const payment = await paymentRepository.findById(id)
    if (!payment) throw new Error('Payment not found')
    return payment
  },

  async getStats(landlordId: string) {
    return paymentRepository.getStats(landlordId)
  },

  async create(data: CreatePaymentInput, landlordId: string) {
    const lease = await prisma.lease.findUnique({
      where: { id: data.leaseId },
      include: { tenant: { select: { id: true, name: true, assignedLandlordId: true } }, organization: true },
    })
    if (!lease || lease.tenant.assignedLandlordId !== landlordId) {
      throw new Error('Lease not found')
    }

    const payment = await paymentRepository.create({
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      method: data.method,
      lease: { connect: { id: data.leaseId } },
      organization: { connect: { id: lease.organizationId } },
    })

    await auditRepository.create({
      action: 'payment.created',
      entityType: 'Payment',
      entityId: payment.id,
      userId: landlordId,
      organizationId: lease.organizationId,
      metadata: { amount: data.amount, leaseId: data.leaseId },
    })

    await notificationService.notify({
      type: 'PAYMENT',
      title: 'New Payment Due',
      message: `A payment of $${data.amount.toFixed(2)} is due on ${new Date(data.dueDate).toLocaleDateString()}`,
      link: '/dashboard/payments',
      userId: lease.tenantId,
      organizationId: lease.organizationId,
    })

    return payment
  },

  async update(id: string, data: UpdatePaymentInput, landlordId: string) {
    const existing = await paymentRepository.findById(id)
    if (!existing || existing.lease.tenant.assignedLandlordId !== landlordId) {
      throw new Error('Payment not found')
    }

    const updateData: Record<string, unknown> = { ...data }

    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.paidAt = new Date()
    }

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate)
    }

    if (data.paidAt) {
      updateData.paidAt = new Date(data.paidAt)
    }

    const payment = await paymentRepository.update(id, updateData)

    await auditRepository.create({
      action: 'payment.updated',
      entityType: 'Payment',
      entityId: id,
      userId: landlordId,
      organizationId: existing.organizationId,
      metadata: { changes: data },
    })

    if (data.status && data.status !== existing.status) {
      await notificationService.notify({
        type: 'PAYMENT',
        title: 'Payment Status Updated',
        message: `Your payment of $${existing.amount.toFixed(2)} has been marked as ${data.status.toLowerCase()}`,
        link: '/dashboard/payments',
        userId: existing.lease.tenantId,
        organizationId: existing.organizationId,
      })
    }

    return payment
  },

  async delete(id: string, landlordId: string) {
    const existing = await paymentRepository.findById(id)
    if (!existing || existing.lease.tenant.assignedLandlordId !== landlordId) {
      throw new Error('Payment not found')
    }

    await paymentRepository.delete(id)

    await auditRepository.create({
      action: 'payment.deleted',
      entityType: 'Payment',
      entityId: id,
      userId: landlordId,
      organizationId: existing.organizationId,
      metadata: { amount: existing.amount },
    })
  },
}
