import { announcementRepository, type AnnouncementFilters } from '@/server/repositories/announcement.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from '@/lib/validations/announcement'

export const announcementService = {
  async list(filters: AnnouncementFilters) {
    return announcementRepository.findMany(filters)
  },

  async getById(id: string, organizationId: string) {
    const announcement = await announcementRepository.findById(id, organizationId)
    if (!announcement) throw new Error('Announcement not found')
    return announcement
  },

  async create(data: CreateAnnouncementInput, organizationId: string, userId: string) {
    const announcement = await announcementRepository.create({
      title: data.title,
      content: data.content,
      priority: data.priority,
      targetRoles: data.targetRoles,
      publishedAt: data.publishedAt ?? new Date(),
      expiresAt: data.expiresAt,
      organization: { connect: { id: organizationId } },
      author: { connect: { id: userId } },
      ...(data.propertyId && { property: { connect: { id: data.propertyId } } }),
    })

    await auditRepository.create({
      action: 'announcement.created',
      entityType: 'Announcement',
      entityId: announcement.id,
      userId,
      organizationId,
      metadata: { title: data.title },
    })

    return announcement
  },

  async update(id: string, data: UpdateAnnouncementInput, organizationId: string, userId: string) {
    const existing = await announcementRepository.findById(id, organizationId)
    if (!existing) throw new Error('Announcement not found')

    const announcement = await announcementRepository.update(id, data)

    await auditRepository.create({
      action: 'announcement.updated',
      entityType: 'Announcement',
      entityId: id,
      userId,
      organizationId,
    })

    return announcement
  },

  async delete(id: string, organizationId: string, userId: string) {
    const existing = await announcementRepository.findById(id, organizationId)
    if (!existing) throw new Error('Announcement not found')

    await announcementRepository.delete(id)

    await auditRepository.create({
      action: 'announcement.deleted',
      entityType: 'Announcement',
      entityId: id,
      userId,
      organizationId,
    })
  },
}
