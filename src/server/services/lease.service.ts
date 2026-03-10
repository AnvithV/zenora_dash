import { prisma } from '@/lib/prisma'
import { leaseRepository, type LeaseFilters } from '@/server/repositories/lease.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import type { CreateLeaseInput, UpdateLeaseInput } from '@/lib/validations/lease'

export const leaseService = {
  async list(filters: LeaseFilters) {
    return leaseRepository.findMany(filters)
  },

  async getById(id: string, organizationId: string) {
    const lease = await leaseRepository.findById(id, organizationId)
    if (!lease) throw new Error('Lease not found')
    return lease
  },

  async create(data: CreateLeaseInput, organizationId: string, userId: string) {
    // Check for overlapping leases
    const overlap = await leaseRepository.checkOverlap(data.unitId, data.startDate, data.endDate)
    if (overlap) throw new Error('Lease dates overlap with an existing active lease')

    const lease = await prisma.$transaction(async (tx) => {
      const newLease = await tx.lease.create({
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          monthlyRent: data.monthlyRent,
          securityDeposit: data.securityDeposit,
          status: data.status,
          terms: data.terms,
          unit: { connect: { id: data.unitId } },
          tenant: { connect: { id: data.tenantId } },
          organization: { connect: { id: organizationId } },
          ...(data.previousLeaseId && {
            previousLease: { connect: { id: data.previousLeaseId } },
          }),
        },
        include: {
          unit: { select: { id: true, number: true, property: { select: { id: true, name: true } } } },
          tenant: { select: { id: true, name: true, email: true } },
        },
      })

      if (data.status === 'ACTIVE') {
        await tx.unit.update({ where: { id: data.unitId }, data: { status: 'OCCUPIED' } })
      }

      return newLease
    })

    await auditRepository.create({
      action: 'lease.created',
      entityType: 'Lease',
      entityId: lease.id,
      userId,
      organizationId,
      metadata: { unitId: data.unitId, tenantId: data.tenantId },
    })

    return lease
  },

  async update(id: string, data: UpdateLeaseInput, organizationId: string, userId: string) {
    const existing = await leaseRepository.findById(id, organizationId)
    if (!existing) throw new Error('Lease not found')

    if (data.startDate && data.endDate) {
      const overlap = await leaseRepository.checkOverlap(
        existing.unitId, data.startDate, data.endDate, id
      )
      if (overlap) throw new Error('Lease dates overlap with an existing active lease')
    }

    const updateData: Record<string, unknown> = { ...data }
    delete updateData.unitId
    delete updateData.tenantId
    delete updateData.previousLeaseId

    const lease = await prisma.$transaction(async (tx) => {
      const updated = await tx.lease.update({
        where: { id },
        data: updateData,
        include: {
          unit: { select: { id: true, number: true, property: { select: { id: true, name: true } } } },
          tenant: { select: { id: true, name: true, email: true } },
        },
      })

      if (data.status === 'ACTIVE') {
        await tx.unit.update({ where: { id: existing.unitId }, data: { status: 'OCCUPIED' } })
      } else if (data.status && ['EXPIRED', 'TERMINATED'].includes(data.status)) {
        await tx.unit.update({ where: { id: existing.unitId }, data: { status: 'AVAILABLE' } })
      }

      return updated
    })

    await auditRepository.create({
      action: 'lease.updated',
      entityType: 'Lease',
      entityId: id,
      userId,
      organizationId,
      metadata: { changes: data },
    })

    return lease
  },

  async renew(id: string, newEndDate: Date, newRent: number, organizationId: string, userId: string) {
    const existing = await leaseRepository.findById(id, organizationId)
    if (!existing) throw new Error('Lease not found')
    if (existing.status !== 'ACTIVE') throw new Error('Only active leases can be renewed')

    const newLease = await prisma.$transaction(async (tx) => {
      await tx.lease.update({ where: { id }, data: { status: 'RENEWED' } })

      return tx.lease.create({
        data: {
          startDate: existing.endDate,
          endDate: newEndDate,
          monthlyRent: newRent,
          securityDeposit: existing.securityDeposit,
          status: 'ACTIVE',
          unit: { connect: { id: existing.unitId } },
          tenant: { connect: { id: existing.tenantId } },
          organization: { connect: { id: organizationId } },
          previousLease: { connect: { id } },
        },
        include: {
          unit: { select: { id: true, number: true, property: { select: { id: true, name: true } } } },
          tenant: { select: { id: true, name: true, email: true } },
        },
      })
    })

    await auditRepository.create({
      action: 'lease.renewed',
      entityType: 'Lease',
      entityId: id,
      userId,
      organizationId,
      metadata: { newLeaseId: newLease.id },
    })

    return newLease
  },

  async terminate(id: string, organizationId: string, userId: string) {
    const existing = await leaseRepository.findById(id, organizationId)
    if (!existing) throw new Error('Lease not found')

    const lease = await prisma.$transaction(async (tx) => {
      const updated = await tx.lease.update({
        where: { id },
        data: { status: 'TERMINATED' },
        include: {
          unit: { select: { id: true, number: true, property: { select: { id: true, name: true } } } },
          tenant: { select: { id: true, name: true, email: true } },
        },
      })
      await tx.unit.update({ where: { id: existing.unitId }, data: { status: 'AVAILABLE' } })
      return updated
    })

    await auditRepository.create({
      action: 'lease.terminated',
      entityType: 'Lease',
      entityId: id,
      userId,
      organizationId,
    })

    return lease
  },
}
