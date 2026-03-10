import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'zenoramgmt@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const APP_NAME = 'ZenPortal'

function layout(body: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; color: #1e293b;">${APP_NAME}</h1>
      </div>
      ${body}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
        <p>This is an automated message from ${APP_NAME}. Please do not reply directly to this email.</p>
        <p><a href="${APP_URL}" style="color: #2563eb;">Go to ${APP_NAME}</a></p>
      </div>
    </div>
  `
}

export const emailService = {
  async send(to: string, subject: string, html: string) {
    const resend = getResend()
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email to:', to)
      return null
    }

    try {
      const result = await resend.emails.send({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html: layout(html),
      })
      return result
    } catch (error) {
      console.error('[Email] Failed to send to:', to, error)
      return null
    }
  },

  async accountApproved(to: string, name: string) {
    return this.send(to, 'Your account has been approved', `
      <h2 style="color: #1e293b;">Welcome, ${name}!</h2>
      <p style="color: #475569; line-height: 1.6;">Your ${APP_NAME} account has been approved. You can now log in and access your dashboard.</p>
      <a href="${APP_URL}/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Log In</a>
    `)
  },

  async accountSuspended(to: string, name: string) {
    return this.send(to, 'Account suspended', `
      <h2 style="color: #1e293b;">Account Update</h2>
      <p style="color: #475569; line-height: 1.6;">Hi ${name}, your ${APP_NAME} account has been suspended. If you believe this is an error, please contact your property manager.</p>
    `)
  },

  async roleChanged(to: string, name: string, newRole: string) {
    const roleLabels: Record<string, string> = {
      PLATFORM_ADMIN: 'Platform Admin',
      LANDLORD: 'Landlord',
      TENANT: 'Tenant',
    }
    return this.send(to, 'Your role has been updated', `
      <h2 style="color: #1e293b;">Role Update</h2>
      <p style="color: #475569; line-height: 1.6;">Hi ${name}, your role has been updated to <strong>${roleLabels[newRole] ?? newRole}</strong>.</p>
      <a href="${APP_URL}/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Log In</a>
    `)
  },

  async newMessage(to: string, recipientName: string, senderName: string, preview: string) {
    return this.send(to, `New message from ${senderName}`, `
      <h2 style="color: #1e293b;">New Message</h2>
      <p style="color: #475569; line-height: 1.6;">Hi ${recipientName}, you have a new message from <strong>${senderName}</strong>:</p>
      <div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 12px 16px; margin: 16px 0; color: #334155;">
        ${preview.length > 200 ? preview.substring(0, 200) + '...' : preview}
      </div>
      <a href="${APP_URL}/dashboard/messages" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">View Message</a>
    `)
  },

  async documentShared(to: string, recipientName: string, documentName: string) {
    return this.send(to, `Document shared: ${documentName}`, `
      <h2 style="color: #1e293b;">Document Shared</h2>
      <p style="color: #475569; line-height: 1.6;">Hi ${recipientName}, a new document has been shared with you: <strong>${documentName}</strong></p>
      <a href="${APP_URL}/dashboard/documents" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">View Documents</a>
    `)
  },

  async newRegistration(to: string, adminName: string, newUserName: string, newUserEmail: string) {
    return this.send(to, `New user registration: ${newUserName}`, `
      <h2 style="color: #1e293b;">New Registration</h2>
      <p style="color: #475569; line-height: 1.6;">Hi ${adminName}, a new user has registered and needs approval:</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 4px 0; color: #334155;"><strong>Name:</strong> ${newUserName}</p>
        <p style="margin: 4px 0; color: #334155;"><strong>Email:</strong> ${newUserEmail}</p>
      </div>
      <a href="${APP_URL}/admin/users" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Review Users</a>
    `)
  },

  async announcement(to: string, recipientName: string, title: string, content: string) {
    return this.send(to, `Announcement: ${title}`, `
      <h2 style="color: #1e293b;">${title}</h2>
      <p style="color: #475569; line-height: 1.6;">Hi ${recipientName},</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0; color: #334155; line-height: 1.6;">
        ${content}
      </div>
      <a href="${APP_URL}/dashboard/notices" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">View Announcements</a>
    `)
  },

  async emailVerification(to: string, name: string, token: string) {
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`
    return this.send(to, 'Verify your email address', `
      <h2 style="color: #1e293b;">Welcome, ${name}!</h2>
      <p style="color: #475569; line-height: 1.6;">Thanks for registering with ${APP_NAME}. Please verify your email address by clicking the button below.</p>
      <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Verify Email</a>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `)
  },

  async maintenanceUpdate(to: string, tenantName: string, title: string, newStatus: string) {
    return this.send(to, `Maintenance update: ${title}`, `
      <h2 style="color: #1e293b;">Maintenance Update</h2>
      <p style="color: #475569; line-height: 1.6;">Hi ${tenantName}, your maintenance request <strong>"${title}"</strong> has been updated to: <strong>${newStatus.replace('_', ' ')}</strong></p>
      <a href="${APP_URL}/dashboard/maintenance" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">View Request</a>
    `)
  },
}
