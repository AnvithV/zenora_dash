import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { messageService } from '@/server/services/message.service'
import { apiError, clampPageSize } from '@/lib/api-utils'

type Params = { params: Promise<{ userId: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { userId: otherUserId } = await params
    const user = await requireAuth()

    const { searchParams } = req.nextUrl
    const result = await messageService.getThread({
      userId: user.id,
      otherUserId,
      page: Number(searchParams.get('page')) || 1,
      pageSize: clampPageSize(searchParams.get('pageSize'), 50),
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return apiError(error)
  }
}
