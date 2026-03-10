import { notificationRepository, type NotificationFilters } from '@/server/repositories/notification.repository'

export const notificationService = {
  async list(filters: NotificationFilters) {
    return notificationRepository.findMany(filters)
  },

  async markRead(ids: string[], userId: string) {
    return notificationRepository.markRead(ids, userId)
  },

  async markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId)
  },

  async getUnreadCount(userId: string) {
    return notificationRepository.getUnreadCount(userId)
  },

  async notify(data: {
    type: string
    title: string
    message: string
    link?: string
    userId: string
    organizationId?: string
  }) {
    return notificationRepository.create(data)
  },

  async notifyMany(notifications: {
    type: string
    title: string
    message: string
    link?: string
    userId: string
    organizationId?: string
  }[]) {
    if (notifications.length === 0) return
    return notificationRepository.createMany(notifications)
  },
}
