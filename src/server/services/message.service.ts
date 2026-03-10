import { messageRepository, type MessageThreadFilters } from '@/server/repositories/message.repository'
import { notificationRepository } from '@/server/repositories/notification.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import { emailService } from '@/server/services/email.service'
import { prisma } from '@/lib/prisma'

export const messageService = {
  async getConversations(userId: string) {
    return messageRepository.getConversations(userId)
  },

  async getThread(filters: MessageThreadFilters) {
    // Mark messages from the other user as read
    await messageRepository.markThreadAsRead(filters.otherUserId, filters.userId)

    return messageRepository.getThread(filters)
  },

  async send(data: {
    content: string
    senderId: string
    senderName: string
    recipientId: string
    organizationId: string
  }) {
    const message = await messageRepository.create({
      content: data.content,
      senderId: data.senderId,
      recipientId: data.recipientId,
      organizationId: data.organizationId,
    })

    // Create notification for recipient
    await notificationRepository.create({
      type: 'new_message',
      title: 'New Message',
      message: `${data.senderName ?? 'Someone'} sent you a message`,
      link: `/messages/${data.senderId}`,
      userId: data.recipientId,
      organizationId: data.organizationId,
    })

    // Audit log
    await auditRepository.create({
      action: 'message.sent',
      entityType: 'Message',
      entityId: message.id,
      userId: data.senderId,
      organizationId: data.organizationId,
      metadata: { recipientId: data.recipientId },
    })

    // Send email to recipient
    const recipient = await prisma.user.findUnique({
      where: { id: data.recipientId },
      select: { email: true, name: true },
    })
    if (recipient) {
      emailService.newMessage(recipient.email, recipient.name ?? 'User', data.senderName, data.content)
    }

    return message
  },
}
