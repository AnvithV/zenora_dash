import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isPlatformAdmin } from '@/lib/auth-utils'
import { userService } from '@/server/services/user.service'
import { updateUserSchema } from '@/lib/validations/user'
import { apiError } from '@/lib/api-utils'
import { notificationService } from '@/server/services/notification.service'
import { emailService } from '@/server/services/email.service'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await requireAdmin()
    const user = await userService.getById(id)
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const admin = await requireAdmin()
    const orgId = admin.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    const body = await req.json()
    const data = updateUserSchema.parse(body)

    // Only platform admins can change roles
    if (data.role && !isPlatformAdmin(admin.role)) {
      return NextResponse.json({ success: false, error: 'Only platform admins can change roles' }, { status: 403 })
    }

    // Get current user data before update for comparison
    const existingUser = await userService.getById(id)

    const user = await userService.update(id, data, orgId, admin.id)

    // Send notifications for role/status changes
    if (data.role && data.role !== existingUser.role) {
      await notificationService.notify({
        type: 'role_changed',
        title: 'Role Updated',
        message: `Your role has been changed to ${data.role}`,
        link: '/profile',
        userId: id,
        organizationId: orgId,
      })
      emailService.roleChanged(existingUser.email, existingUser.name ?? 'User', data.role)
    }

    if (data.status && data.status !== existingUser.status) {
      if (data.status === 'ACTIVE') {
        await notificationService.notify({
          type: 'account_approved',
          title: 'Account Approved',
          message: 'Your account has been approved. You can now access the platform.',
          link: '/dashboard',
          userId: id,
          organizationId: orgId,
        })
        emailService.accountApproved(existingUser.email, existingUser.name ?? 'User')
      } else if (data.status === 'SUSPENDED') {
        await notificationService.notify({
          type: 'account_suspended',
          title: 'Account Suspended',
          message: 'Your account has been suspended. Please contact support for more information.',
          userId: id,
          organizationId: orgId,
        })
        emailService.accountSuspended(existingUser.email, existingUser.name ?? 'User')
      }
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const admin = await requireAdmin()
    const orgId = admin.organizationId
    if (!orgId) return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })

    if (!isPlatformAdmin(admin.role)) {
      return NextResponse.json({ success: false, error: 'Only platform admins can delete users' }, { status: 403 })
    }

    await userService.delete(id, orgId, admin.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
