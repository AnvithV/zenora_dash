import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '@/lib/validations/auth'

describe('Registration Flow', () => {
  const validInput = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  }

  it('validates valid registration input', () => {
    expect(() => registerSchema.parse(validInput)).not.toThrow()
  })

  it('rejects short password (less than 8 characters)', () => {
    const input = { ...validInput, password: '123', confirmPassword: '123' }
    expect(() => registerSchema.parse(input)).toThrow()
  })

  it('rejects invalid email', () => {
    const input = { ...validInput, email: 'not-an-email' }
    expect(() => registerSchema.parse(input)).toThrow()
  })

  it('rejects short name (less than 2 characters)', () => {
    const input = { ...validInput, name: 'A' }
    expect(() => registerSchema.parse(input)).toThrow()
  })

  it('rejects mismatched passwords', () => {
    const input = { ...validInput, password: 'password123', confirmPassword: 'different456' }
    expect(() => registerSchema.parse(input)).toThrow()
  })

  it('rejects missing confirmPassword', () => {
    const { confirmPassword, ...withoutConfirm } = validInput
    expect(() => registerSchema.parse(withoutConfirm)).toThrow()
  })

  it('rejects empty name', () => {
    const input = { ...validInput, name: '' }
    expect(() => registerSchema.parse(input)).toThrow()
  })

  it('rejects empty email', () => {
    const input = { ...validInput, email: '' }
    expect(() => registerSchema.parse(input)).toThrow()
  })

  it('rejects empty password', () => {
    const input = { ...validInput, password: '', confirmPassword: '' }
    expect(() => registerSchema.parse(input)).toThrow()
  })

  it('accepts name with exactly 2 characters', () => {
    const input = { ...validInput, name: 'Jo' }
    expect(() => registerSchema.parse(input)).not.toThrow()
  })

  it('accepts password with exactly 8 characters', () => {
    const input = { ...validInput, password: '12345678', confirmPassword: '12345678' }
    expect(() => registerSchema.parse(input)).not.toThrow()
  })

  it('rejects missing required fields', () => {
    expect(() => registerSchema.parse({})).toThrow()
  })
})

describe('Login Flow', () => {
  it('validates valid login input', () => {
    const input = { email: 'user@example.com', password: 'password123' }
    expect(() => loginSchema.parse(input)).not.toThrow()
  })

  it('rejects invalid email', () => {
    const input = { email: 'bad-email', password: 'password123' }
    expect(() => loginSchema.parse(input)).toThrow()
  })

  it('rejects empty password', () => {
    const input = { email: 'user@example.com', password: '' }
    expect(() => loginSchema.parse(input)).toThrow()
  })

  it('rejects missing fields', () => {
    expect(() => loginSchema.parse({})).toThrow()
  })
})
