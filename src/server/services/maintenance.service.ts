import { maintenanceRepository, type MaintenanceFilters } from '@/server/repositories/maintenance.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import { notificationService } from '@/server/services/notification.service'
import { emailService } from '@/server/services/email.service'
import { prisma } from '@/lib/prisma'
import type { CreateMaintenanceInput, UpdateMaintenanceInput, CreateCommentInput } from '@/lib/validations/maintenance'

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['CLOSED', 'OPEN'],
  CLOSED: ['OPEN'],
}

export const maintenanceService = {
  async list(filters: MaintenanceFilters) {
    return maintenanceRepository.findMany(filters)
  },

  async getById(id: string, organizationId: string, options?: { filterInternalComments?: boolean }) {
    const request = await maintenanceRepository.findById(id, organizationId)
    if (!request) throw new Error('Maintenance request not found')

    if (options?.filterInternalComments) {
      request.comments = request.comments.filter((c: { isInternal: boolean }) => !c.isInternal)
    }

    return request
  },

  async create(data: CreateMaintenanceInput, organizationId: string, userId: string) {
    const request = await maintenanceRepository.create({
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      unit: { connect: { id: data.unitId } },
      property: { connect: { id: data.propertyId } },
      organization: { connect: { id: organizationId } },
      requester: { connect: { id: userId } },
    })

    await auditRepository.create({
      action: 'maintenance.created',
      entityType: 'MaintenanceRequest',
      entityId: request.id,
      userId,
      organizationId,
      metadata: { title: data.title, priority: data.priority },
    })

    // Notify the tenant's assigned landlord
    const requester = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, assignedLandlordId: true },
    })
    if (requester?.assignedLandlordId) {
      await notificationService.notify({
        type: 'MAINTENANCE',
        title: 'New Maintenance Request',
        message: `${requester.name ?? 'A tenant'} submitted: "${data.title}" (${data.priority})`,
        link: '/landlord/tenants',
        userId: requester.assignedLandlordId,
        organizationId,
      })
    }

    return request
  },

  async update(id: string, data: UpdateMaintenanceInput, organizationId: string, userId: string) {
    const existing = await maintenanceRepository.findById(id, organizationId)
    if (!existing) throw new Error('Maintenance request not found')

    // Validate status transition
    if (data.status && data.status !== existing.status) {
      const validNext = VALID_TRANSITIONS[existing.status]
      if (!validNext?.includes(data.status)) {
        throw new Error(`Cannot transition from ${existing.status} to ${data.status}`)
      }
    }

    const updateData: Record<string, unknown> = { ...data }
    if (data.assigneeId !== undefined) {
      delete updateData.assigneeId
      updateData.assignee = data.assigneeId
        ? { connect: { id: data.assigneeId } }
        : { disconnect: true }
    }

    if (data.status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
    } else if (data.status === 'CLOSED') {
      updateData.closedAt = new Date()
    }

    const request = await maintenanceRepository.update(id, updateData)

    await auditRepository.create({
      action: 'maintenance.updated',
      entityType: 'MaintenanceRequest',
      entityId: id,
      userId,
      organizationId,
      metadata: { changes: data },
    })

    // Email the tenant if status changed
    if (data.status && data.status !== existing.status) {
      const requester = await prisma.user.findUnique({
        where: { id: existing.requesterId },
        select: { email: true, name: true },
      })
      if (requester) {
        emailService.maintenanceUpdate(requester.email, requester.name ?? 'Tenant', existing.title, data.status)
      }
    }

    return request
  },

  async addComment(requestId: string, data: CreateCommentInput, organizationId: string, userId: string) {
    const request = await maintenanceRepository.findById(requestId, organizationId)
    if (!request) throw new Error('Maintenance request not found')

    const comment = await maintenanceRepository.addComment({
      content: data.content,
      isInternal: data.isInternal,
      request: { connect: { id: requestId } },
      author: { connect: { id: userId } },
    })

    await auditRepository.create({
      action: 'maintenance.comment_added',
      entityType: 'MaintenanceComment',
      entityId: comment.id,
      userId,
      organizationId,
      metadata: { requestId, isInternal: data.isInternal },
    })

    return comment
  },

  async delete(id: string, organizationId: string, userId: string) {
    const existing = await maintenanceRepository.findById(id, organizationId)
    if (!existing) throw new Error('Maintenance request not found')

    await maintenanceRepository.delete(id)

    await auditRepository.create({
      action: 'maintenance.deleted',
      entityType: 'MaintenanceRequest',
      entityId: id,
      userId,
      organizationId,
      metadata: { title: existing.title },
    })
  },
}
