import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { messageService } from '@/server/services/message.service'
import { sendMessageSchema } from '@/lib/validations/message'
import { apiError } from '@/lib/api-utils'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET() {
  try {
    const user = await requireAuth()
    const conversations = await messageService.getConversations(user.id)
    return NextResponse.json({ success: true, data: conversations })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const { success, resetIn } = rateLimit(`message:${user.id}`, RATE_LIMITS.UPLOAD)
    if (!success) return rateLimitResponse(resetIn)

    const body = await req.json()
    const data = sendMessageSchema.parse(body)

    if (data.recipientId === user.id) {
      return NextResponse.json({ success: false, error: 'Cannot send message to yourself' }, { status: 400 })
    }

    const message = await messageService.send({
      content: data.content,
      senderId: user.id,
      senderName: user.name ?? 'Unknown',
      recipientId: data.recipientId,
      organizationId: orgId,
    })

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
