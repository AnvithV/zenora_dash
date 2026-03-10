import { userDocumentRepository, type UserDocumentFilters } from '@/server/repositories/user-document.repository'
import { notificationRepository } from '@/server/repositories/notification.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import { emailService } from '@/server/services/email.service'
import { prisma } from '@/lib/prisma'
import type { CreateUserDocumentInput } from '@/lib/validations/user-document'

export const userDocumentService = {
  async list(filters: UserDocumentFilters) {
    return userDocumentRepository.findMany(filters)
  },

  async getById(id: string, organizationId: string) {
    const doc = await userDocumentRepository.findById(id, organizationId)
    if (!doc) throw new Error('User document not found')
    return doc
  },

  async create(data: CreateUserDocumentInput, organizationId: string, uploadedById: string) {
    const doc = await userDocumentRepository.create({
      name: data.name,
      description: data.description,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      url: data.url,
      user: { connect: { id: data.userId } },
      uploadedBy: { connect: { id: uploadedById } },
      organization: { connect: { id: organizationId } },
    })

    // Notify the user that a document was shared with them
    await notificationRepository.create({
      type: 'document_shared',
      title: 'Document Shared',
      message: `A document "${data.name}" has been shared with you`,
      link: `/user-documents/${doc.id}`,
      userId: data.userId,
      organizationId,
    })

    await auditRepository.create({
      action: 'user_document.created',
      entityType: 'UserDocument',
      entityId: doc.id,
      userId: uploadedById,
      organizationId,
      metadata: { name: data.name, targetUserId: data.userId },
    })

    // Email the user about the shared document
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true, name: true },
    })
    if (targetUser) {
      emailService.documentShared(targetUser.email, targetUser.name ?? 'User', data.name)
    }

    return doc
  },

  async delete(id: string, organizationId: string, adminId: string) {
    const doc = await userDocumentRepository.findById(id, organizationId)
    if (!doc) throw new Error('User document not found')

    await userDocumentRepository.delete(id)

    await auditRepository.create({
      action: 'user_document.deleted',
      entityType: 'UserDocument',
      entityId: id,
      userId: adminId,
      organizationId,
      metadata: { name: doc.name, targetUserId: doc.user.id },
    })
  },
}
