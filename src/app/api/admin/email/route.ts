import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-utils'
import { sendEmailSchema } from '@/lib/validations/email'
import { emailService } from '@/server/services/email.service'
import { auditRepository } from '@/server/repositories/audit.repository'

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const data = sendEmailSchema.parse(body)

    const result = await emailService.send(data.to, data.subject, `
      <div style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${data.body}</div>
    `)

    if (admin.organizationId) {
      await auditRepository.create({
        action: 'email.sent',
        entityType: 'Email',
        entityId: data.to,
        userId: admin.id,
        organizationId: admin.organizationId,
        metadata: { to: data.to, subject: data.subject },
      })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return apiError(error)
  }
}
