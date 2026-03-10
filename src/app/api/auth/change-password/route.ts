import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { changePasswordSchema } from '@/lib/validations/user'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'
import { apiError } from '@/lib/api-utils'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    const { success, resetIn } = rateLimit(`change-pwd:${user.id}`, RATE_LIMITS.AUTH_STRICT)
    if (!success) return rateLimitResponse(resetIn)

    const body = await req.json()
    const data = changePasswordSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!dbUser?.password) {
      return NextResponse.json({ success: false, error: 'No password set for this account' }, { status: 400 })
    }

    const isValid = await bcrypt.compare(data.currentPassword, dbUser.password)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
