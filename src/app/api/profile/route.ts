import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { updateProfileSchema } from '@/lib/validations/user'
import { apiError } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await requireAuth()

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        phone: data.phone,
        image: data.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return apiError(error)
  }
}
