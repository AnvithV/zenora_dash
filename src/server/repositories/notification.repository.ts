import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type NotificationFilters = {
  userId: string
  read?: boolean
  type?: string
  organizationId?: string
  page?: number
  pageSize?: number
  sortOrder?: 'asc' | 'desc'
}

export const notificationRepository = {
  async findMany(filters: NotificationFilters) {
    const {
      userId, read, type, organizationId,
      page = 1, pageSize = 20, sortOrder = 'desc',
    } = filters

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(read !== undefined && { read }),
      ...(type && { type }),
      ...(organizationId && { organizationId }),
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  },

  async markRead(ids: string[], userId: string) {
    return prisma.notification.updateMany({
      where: { id: { in: ids }, userId },
      data: { read: true },
    })
  },

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  },

  async create(data: {
    type: string
    title: string
    message: string
    link?: string
    userId: string
    organizationId?: string
  }) {
    return prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        user: { connect: { id: data.userId } },
        ...(data.organizationId && { organization: { connect: { id: data.organizationId } } }),
      },
    })
  },

  async createMany(notifications: {
    type: string
    title: string
    message: string
    link?: string
    userId: string
    organizationId?: string
  }[]) {
    return prisma.notification.createMany({
      data: notifications.map(n => ({
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        userId: n.userId,
        organizationId: n.organizationId,
      })),
    })
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    })
  },
}
