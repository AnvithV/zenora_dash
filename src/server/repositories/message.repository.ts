import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type MessageThreadFilters = {
  userId: string
  otherUserId: string
  page?: number
  pageSize?: number
}

export const messageRepository = {
  async getConversations(userId: string) {
    // Get the latest message per conversation partner
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { recipientId: true },
      distinct: ['recipientId'],
    })

    const receivedMessages = await prisma.message.findMany({
      where: { recipientId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    })

    // Collect unique conversation partner IDs
    const partnerIds = new Set<string>()
    sentMessages.forEach(m => partnerIds.add(m.recipientId))
    receivedMessages.forEach(m => partnerIds.add(m.senderId))

    const conversations = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        const [latestMessage, unreadCount, partner] = await Promise.all([
          prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, recipientId: partnerId },
                { senderId: partnerId, recipientId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.message.count({
            where: {
              senderId: partnerId,
              recipientId: userId,
              readAt: null,
            },
          }),
          prisma.user.findUnique({
            where: { id: partnerId },
            select: { id: true, name: true, email: true, image: true, role: true },
          }),
        ])

        return { partner, latestMessage, unreadCount }
      })
    )

    // Sort by latest message date
    conversations.sort((a, b) => {
      const dateA = a.latestMessage?.createdAt ?? new Date(0)
      const dateB = b.latestMessage?.createdAt ?? new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

    return conversations
  },

  async getThread(filters: MessageThreadFilters) {
    const { userId, otherUserId, page = 1, pageSize = 50 } = filters

    const where: Prisma.MessageWhereInput = {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    }

    const [items, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, image: true } },
          recipient: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.message.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async markThreadAsRead(senderId: string, recipientId: string) {
    return prisma.message.updateMany({
      where: {
        senderId,
        recipientId,
        readAt: null,
      },
      data: { readAt: new Date() },
    })
  },

  async create(data: {
    content: string
    senderId: string
    recipientId: string
    organizationId: string
  }) {
    return prisma.message.create({
      data: {
        content: data.content,
        sender: { connect: { id: data.senderId } },
        recipient: { connect: { id: data.recipientId } },
        organization: { connect: { id: data.organizationId } },
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        recipient: { select: { id: true, name: true, image: true } },
      },
    })
  },
}
