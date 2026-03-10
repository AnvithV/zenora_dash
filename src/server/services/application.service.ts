import { applicationRepository, type ApplicationFilters } from '@/server/repositories/application.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import type { CreateApplicationInput, ReviewApplicationInput } from '@/lib/validations/application'

export const applicationService = {
  async list(filters: ApplicationFilters) {
    return applicationRepository.findMany(filters)
  },

  async getById(id: string, organizationId: string) {
    const application = await applicationRepository.findById(id, organizationId)
    if (!application) throw new Error('Application not found')
    return application
  },

  async create(data: CreateApplicationInput, organizationId: string, userId: string) {
    const application = await applicationRepository.create({
      moveInDate: data.moveInDate,
      message: data.message,
      unit: { connect: { id: data.unitId } },
      property: { connect: { id: data.propertyId } },
      organization: { connect: { id: organizationId } },
      applicant: { connect: { id: userId } },
    })

    await auditRepository.create({
      action: 'application.created',
      entityType: 'Application',
      entityId: application.id,
      userId,
      organizationId,
      metadata: { unitId: data.unitId },
    })

    return application
  },

  async review(id: string, data: ReviewApplicationInput, organizationId: string, userId: string) {
    const existing = await applicationRepository.findById(id, organizationId)
    if (!existing) throw new Error('Application not found')

    // Validate status transition — only allow valid review statuses
    const validReviewStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED']
    if (!validReviewStatuses.includes(data.status)) {
      throw new Error(`Invalid review status: ${data.status}`)
    }

    const application = await applicationRepository.update(id, {
      status: data.status,
      reviewNotes: data.reviewNotes,
      reviewedAt: new Date(),
    })

    await auditRepository.create({
      action: `application.${data.status.toLowerCase()}`,
      entityType: 'Application',
      entityId: id,
      userId,
      organizationId,
      metadata: { status: data.status },
    })

    return application
  },

  async withdraw(id: string, organizationId: string, userId: string) {
    const existing = await applicationRepository.findById(id, organizationId)
    if (!existing) throw new Error('Application not found')
    if (existing.applicantId !== userId) throw new Error('Can only withdraw your own application')

    const application = await applicationRepository.update(id, { status: 'WITHDRAWN' })

    await auditRepository.create({
      action: 'application.withdrawn',
      entityType: 'Application',
      entityId: id,
      userId,
      organizationId,
    })

    return application
  },
}
