import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { notificationService } from '@/server/services/notification.service'
import { markNotificationsReadSchema } from '@/lib/validations/notification'
import { apiError, clampPageSize } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = req.nextUrl
    const readParam = searchParams.get('read')

    const result = await notificationService.list({
      userId: user.id,
      ...(readParam !== null && { read: readParam === 'true' }),
      type: searchParams.get('type') ?? undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: clampPageSize(searchParams.get('pageSize'), 20),
    })

    const unreadCount = await notificationService.getUnreadCount(user.id)

    return NextResponse.json({ success: true, ...result, unreadCount })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await req.json()
    const data = markNotificationsReadSchema.parse(body)

    if (data.all) {
      await notificationService.markAllRead(user.id)
    } else if (data.ids) {
      await notificationService.markRead(data.ids, user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
