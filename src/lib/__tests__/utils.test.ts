import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatDate, formatDateTime, getInitials } from '@/lib/utils'

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('merges conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('handles undefined and null inputs', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('handles empty arguments', () => {
    expect(cn()).toBe('')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('merges conflicting Tailwind text color classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})

describe('formatCurrency', () => {
  it('formats a whole number as USD', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })

  it('formats a decimal number as USD', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero as USD', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats negative numbers as USD', () => {
    expect(formatCurrency(-500)).toBe('-$500.00')
  })

  it('formats very large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })

  it('rounds to two decimal places', () => {
    expect(formatCurrency(99.999)).toBe('$100.00')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date('2024-01-15T00:00:00Z')
    const result = formatDate(date)
    // en-US medium dateStyle: "Jan 15, 2024" (may vary slightly by timezone)
    expect(result).toMatch(/Jan\s+1[45],\s+2024/)
  })

  it('formats a date string', () => {
    const result = formatDate('2024-06-01T12:00:00Z')
    expect(result).toMatch(/Jun\s+\d{1,2},\s+2024/)
  })

  it('formats an ISO date string', () => {
    const result = formatDate('2023-12-25')
    expect(result).toMatch(/Dec\s+2[45],\s+2023/)
  })
})

describe('formatDateTime', () => {
  it('formats a Date object with date and time', () => {
    const date = new Date('2024-01-15T14:30:00Z')
    const result = formatDateTime(date)
    // Should contain date and time portions
    expect(result).toMatch(/Jan\s+1[45],\s+2024/)
    expect(result).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/)
  })

  it('formats a date string with date and time', () => {
    const result = formatDateTime('2024-06-01T09:00:00Z')
    expect(result).toMatch(/Jun\s+\d{1,2},\s+2024/)
    expect(result).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/)
  })
})

describe('getInitials', () => {
  it('returns initials for a two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns initials for a single name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns first two initials for a three-word name', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('returns uppercase initials for lowercase input', () => {
    expect(getInitials('jane smith')).toBe('JS')
  })

  it('handles a name with many parts', () => {
    expect(getInitials('A B C D E')).toBe('AB')
  })
})

