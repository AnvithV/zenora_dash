import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { notificationRepository } from '@/server/repositories/notification.repository'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const { success, resetIn } = rateLimit(`register:${ip}`, RATE_LIMITS.AUTH_LOGIN)
    if (!success) return rateLimitResponse(resetIn)

    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Find or create default organization
    let org = await prisma.organization.findFirst({
      where: { slug: 'default' },
    })

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Default Organization',
          slug: 'default',
        },
      })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TENANT',
        status: 'PENDING',
        memberships: {
          create: {
            organizationId: org.id,
            role: 'TENANT',
          },
        },
      },
    })

    // Notify all platform admins about the new pending registration
    const platformAdmins = await prisma.user.findMany({
      where: { role: 'PLATFORM_ADMIN', status: 'ACTIVE' },
      select: { id: true },
    })

    if (platformAdmins.length > 0) {
      await notificationRepository.createMany(
        platformAdmins.map((admin) => ({
          type: 'new_registration',
          title: 'New User Registration',
          message: `${name} (${email}) has registered and is pending approval`,
          link: '/admin/users',
          userId: admin.id,
          organizationId: org.id,
        }))
      )
    }

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, status: 'PENDING' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}
