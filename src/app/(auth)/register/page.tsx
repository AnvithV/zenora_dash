'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [form, setForm] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const validated = registerSchema.parse(form)

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: validated.name,
          email: validated.email,
          password: validated.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setRegisteredEmail(validated.email)
      setRegistered(true)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50/60 via-white to-slate-100 px-4">
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-100/30 blur-3xl" />
        <div className="relative w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">ZenPortal</h1>
            <h2 className="mt-2 text-xl text-slate-500">Check your email</h2>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/30 backdrop-blur-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 ring-1 ring-violet-100">
              <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mt-4 text-slate-700 font-medium">Verification email sent!</p>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;ve sent a verification link to <strong>{registeredEmail}</strong>.
              Please check your inbox and click the link to verify your email.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              After verifying, an admin will review and approve your account.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-2.5 text-sm text-white font-semibold shadow-sm shadow-violet-200 transition-all duration-200 hover:from-violet-700 hover:to-violet-600 hover:shadow-md active:scale-[0.98]"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50/60 via-white to-slate-100 px-4">
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-100/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-violet-200/20 blur-3xl" />
      <div className="relative w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">ZenPortal</h1>
          <h2 className="mt-2 text-xl text-slate-500">Create your account</h2>
        </div>

        <div className="rounded-xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/30 backdrop-blur-sm">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm text-white font-semibold shadow-sm shadow-violet-200 transition-all duration-200 hover:from-violet-700 hover:to-violet-600 hover:shadow-md hover:shadow-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-violet-600 hover:text-violet-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
