import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import { createPropertySchema } from '@/lib/validations/property'
import { sendMessageSchema } from '@/lib/validations/message'
import { markNotificationsReadSchema } from '@/lib/validations/notification'
import { createUserDocumentSchema } from '@/lib/validations/user-document'
import { updateUserSchema } from '@/lib/validations/user'
import { createAnnouncementSchema } from '@/lib/validations/announcement'

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address')
    }
  })

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required')
    }
  })

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('accepts a password with exactly 1 character', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'a',
    })
    expect(result.success).toBe(true)
  })
})

describe('registerSchema', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  }

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: 'J',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('name'))
      expect(nameError?.message).toBe('Name must be at least 2 characters')
    }
  })

  it('accepts a name with exactly 2 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: 'Jo',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const pwError = result.error.issues.find((i) => i.path.includes('password'))
      expect(pwError?.message).toBe('Password must be at least 8 characters')
    }
  })

  it('accepts a password with exactly 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: '12345678',
      confirmPassword: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password123',
      confirmPassword: 'different456',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find((i) =>
        i.path.includes('confirmPassword')
      )
      expect(confirmError?.message).toBe('Passwords do not match')
    }
  })

  it('rejects missing confirmPassword', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })
})

describe('createPropertySchema', () => {
  const validProperty = {
    name: 'Sunrise Apartments',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    type: 'RESIDENTIAL' as const,
  }

  it('accepts valid property data with only required fields', () => {
    const result = createPropertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.country).toBe('US')
      expect(result.data.status).toBe('ACTIVE')
      expect(result.data.totalUnits).toBe(0)
    }
  })

  it('accepts valid property data with all fields', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      country: 'CA',
      status: 'UNDER_CONSTRUCTION',
      description: 'A beautiful apartment complex',
      yearBuilt: 2020,
      totalUnits: 50,
      ownerId: 'owner-123',
      managerId: 'manager-456',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      name: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an address shorter than 5 characters', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      address: '123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a city shorter than 2 characters', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      city: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a state shorter than 2 characters', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      state: 'N',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a zipCode shorter than 5 characters', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      zipCode: '100',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid property types', () => {
    const types = ['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL'] as const
    for (const type of types) {
      const result = createPropertySchema.safeParse({ ...validProperty, type })
      expect(result.success).toBe(true)
    }
  })

  it('rejects an invalid property type', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      type: 'INVALID_TYPE',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid status values', () => {
    const statuses = ['ACTIVE', 'INACTIVE', 'UNDER_CONSTRUCTION'] as const
    for (const status of statuses) {
      const result = createPropertySchema.safeParse({ ...validProperty, status })
      expect(result.success).toBe(true)
    }
  })

  it('rejects an invalid status', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      status: 'DEMOLISHED',
    })
    expect(result.success).toBe(false)
  })

  it('defaults country to US when not provided', () => {
    const result = createPropertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.country).toBe('US')
    }
  })

  it('defaults status to ACTIVE when not provided', () => {
    const result = createPropertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('ACTIVE')
    }
  })

  it('defaults totalUnits to 0 when not provided', () => {
    const result = createPropertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.totalUnits).toBe(0)
    }
  })

  it('rejects yearBuilt below 1800', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      yearBuilt: 1799,
    })
    expect(result.success).toBe(false)
  })

  it('accepts yearBuilt at boundary 1800', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      yearBuilt: 1800,
    })
    expect(result.success).toBe(true)
  })

  it('rejects yearBuilt above 2030', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      yearBuilt: 2031,
    })
    expect(result.success).toBe(false)
  })

  it('accepts yearBuilt at boundary 2030', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      yearBuilt: 2030,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-integer yearBuilt', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      yearBuilt: 2020.5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative totalUnits', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      totalUnits: -1,
    })
    expect(result.success).toBe(false)
  })

  it('accepts totalUnits of 0', () => {
    const result = createPropertySchema.safeParse({
      ...validProperty,
      totalUnits: 0,
    })
    expect(result.success).toBe(true)
  })

  it('allows description to be optional', () => {
    const result = createPropertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeUndefined()
    }
  })

  it('allows ownerId to be optional', () => {
    const result = createPropertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ownerId).toBeUndefined()
    }
  })

  it('allows managerId to be optional', () => {
    const result = createPropertySchema.safeParse(validProperty)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.managerId).toBeUndefined()
    }
  })

  it('rejects missing required fields', () => {
    const result = createPropertySchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// Message Validation
// ============================================================

describe('sendMessageSchema', () => {
  it('accepts a valid message', () => {
    const input = { recipientId: 'user-123', content: 'Hello there' }
    expect(() => sendMessageSchema.parse(input)).not.toThrow()
  })

  it('rejects empty content', () => {
    const input = { recipientId: 'user-123', content: '' }
    expect(() => sendMessageSchema.parse(input)).toThrow()
  })

  it('rejects content over 5000 characters', () => {
    const input = { recipientId: 'user-123', content: 'a'.repeat(5001) }
    expect(() => sendMessageSchema.parse(input)).toThrow()
  })

  it('accepts content at exactly 5000 characters', () => {
    const input = { recipientId: 'user-123', content: 'a'.repeat(5000) }
    expect(() => sendMessageSchema.parse(input)).not.toThrow()
  })

  it('rejects missing recipientId', () => {
    const input = { content: 'Hello there' }
    expect(() => sendMessageSchema.parse(input)).toThrow()
  })

  it('rejects empty recipientId', () => {
    const input = { recipientId: '', content: 'Hello there' }
    expect(() => sendMessageSchema.parse(input)).toThrow()
  })
})

// ============================================================
// Notification Validation
// ============================================================

describe('markNotificationsReadSchema', () => {
  it('accepts ids array', () => {
    const input = { ids: ['id1', 'id2'] }
    expect(() => markNotificationsReadSchema.parse(input)).not.toThrow()
  })

  it('accepts all: true', () => {
    const input = { all: true }
    expect(() => markNotificationsReadSchema.parse(input)).not.toThrow()
  })

  it('accepts both ids and all provided together', () => {
    const input = { ids: ['id1'], all: true }
    expect(() => markNotificationsReadSchema.parse(input)).not.toThrow()
  })

  it('rejects empty object (neither ids nor all)', () => {
    const input = {}
    expect(() => markNotificationsReadSchema.parse(input)).toThrow()
  })

  it('rejects when all is false and ids is undefined', () => {
    const input = { all: false }
    expect(() => markNotificationsReadSchema.parse(input)).toThrow()
  })
})

// ============================================================
// User Document Validation
// ============================================================

describe('createUserDocumentSchema', () => {
  const validDocument = {
    name: 'Lease Agreement',
    description: 'Annual lease',
    userId: 'user-123',
    fileName: 'lease.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    url: '/uploads/lease.pdf',
  }

  it('accepts a valid document', () => {
    expect(() => createUserDocumentSchema.parse(validDocument)).not.toThrow()
  })

  it('accepts a document without optional description', () => {
    const { description, ...withoutDesc } = validDocument
    expect(() => createUserDocumentSchema.parse(withoutDesc)).not.toThrow()
  })

  it('rejects missing name', () => {
    const { name, ...withoutName } = validDocument
    expect(() => createUserDocumentSchema.parse(withoutName)).toThrow()
  })

  it('rejects empty name', () => {
    expect(() => createUserDocumentSchema.parse({ ...validDocument, name: '' })).toThrow()
  })

  it('rejects missing userId', () => {
    const { userId, ...withoutUserId } = validDocument
    expect(() => createUserDocumentSchema.parse(withoutUserId)).toThrow()
  })

  it('rejects empty userId', () => {
    expect(() => createUserDocumentSchema.parse({ ...validDocument, userId: '' })).toThrow()
  })
})

// ============================================================
// User Update Validation
// ============================================================

describe('updateUserSchema', () => {
  it('accepts valid update with role PLATFORM_ADMIN', () => {
    const input = { name: 'Admin User', role: 'PLATFORM_ADMIN' as const }
    expect(() => updateUserSchema.parse(input)).not.toThrow()
  })

  it('accepts valid update with role LANDLORD', () => {
    const input = { role: 'LANDLORD' as const }
    expect(() => updateUserSchema.parse(input)).not.toThrow()
  })

  it('accepts valid update with role TENANT', () => {
    const input = { role: 'TENANT' as const }
    expect(() => updateUserSchema.parse(input)).not.toThrow()
  })

  it('rejects invalid role SUPER_ADMIN', () => {
    const input = { role: 'SUPER_ADMIN' }
    expect(() => updateUserSchema.parse(input)).toThrow()
  })

  it('rejects invalid role APPLICANT', () => {
    const input = { role: 'APPLICANT' }
    expect(() => updateUserSchema.parse(input)).toThrow()
  })

  it('rejects invalid role VENDOR', () => {
    const input = { role: 'VENDOR' }
    expect(() => updateUserSchema.parse(input)).toThrow()
  })

  it('rejects invalid role PROPERTY_MANAGER', () => {
    const input = { role: 'PROPERTY_MANAGER' }
    expect(() => updateUserSchema.parse(input)).toThrow()
  })

  it('accepts valid status values', () => {
    for (const status of ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'] as const) {
      expect(() => updateUserSchema.parse({ status })).not.toThrow()
    }
  })

  it('rejects name shorter than 2 characters', () => {
    const input = { name: 'A' }
    expect(() => updateUserSchema.parse(input)).toThrow()
  })

  it('accepts empty object since all fields are optional', () => {
    expect(() => updateUserSchema.parse({})).not.toThrow()
  })
})

// ============================================================
// Announcement Validation
// ============================================================

describe('createAnnouncementSchema', () => {
  const validAnnouncement = {
    title: 'Important Notice',
    content: 'This is an important announcement for all residents.',
    priority: 'normal' as const,
    targetRoles: ['TENANT' as const],
  }

  it('accepts a valid announcement', () => {
    expect(() => createAnnouncementSchema.parse(validAnnouncement)).not.toThrow()
  })

  it('accepts announcement with all valid target roles', () => {
    const input = {
      ...validAnnouncement,
      targetRoles: ['PLATFORM_ADMIN' as const, 'LANDLORD' as const, 'TENANT' as const],
    }
    expect(() => createAnnouncementSchema.parse(input)).not.toThrow()
  })

  it('rejects empty targetRoles array', () => {
    const input = { ...validAnnouncement, targetRoles: [] }
    expect(() => createAnnouncementSchema.parse(input)).toThrow()
  })

  it('rejects invalid target role', () => {
    const input = { ...validAnnouncement, targetRoles: ['SUPER_ADMIN'] }
    expect(() => createAnnouncementSchema.parse(input)).toThrow()
  })

  it('rejects title shorter than 3 characters', () => {
    const input = { ...validAnnouncement, title: 'AB' }
    expect(() => createAnnouncementSchema.parse(input)).toThrow()
  })

  it('rejects content shorter than 10 characters', () => {
    const input = { ...validAnnouncement, content: 'Short' }
    expect(() => createAnnouncementSchema.parse(input)).toThrow()
  })

  it('defaults priority to normal when not provided', () => {
    const { priority, ...withoutPriority } = validAnnouncement
    const result = createAnnouncementSchema.parse(withoutPriority)
    expect(result.priority).toBe('normal')
  })

  it('accepts all valid priority values', () => {
    for (const priority of ['low', 'normal', 'high'] as const) {
      expect(() => createAnnouncementSchema.parse({ ...validAnnouncement, priority })).not.toThrow()
    }
  })

  it('rejects invalid priority value', () => {
    const input = { ...validAnnouncement, priority: 'critical' }
    expect(() => createAnnouncementSchema.parse(input)).toThrow()
  })

  it('accepts optional propertyId', () => {
    const input = { ...validAnnouncement, propertyId: 'prop-123' }
    expect(() => createAnnouncementSchema.parse(input)).not.toThrow()
  })

  it('transforms publishedAt string to Date', () => {
    const input = { ...validAnnouncement, publishedAt: '2026-01-01T00:00:00Z' }
    const result = createAnnouncementSchema.parse(input)
    expect(result.publishedAt).toBeInstanceOf(Date)
  })

  it('transforms expiresAt string to Date', () => {
    const input = { ...validAnnouncement, expiresAt: '2026-12-31T23:59:59Z' }
    const result = createAnnouncementSchema.parse(input)
    expect(result.expiresAt).toBeInstanceOf(Date)
  })
})
