import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth-utils'
import Link from 'next/link'
import { Building2, FileText, Wrench, Shield } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    if (isAdminRole(session.user.role)) {
      redirect('/admin/users')
    } else {
      redirect('/dashboard/overview')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-violet-700"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-violet-200 transition-all duration-200 hover:bg-violet-700 hover:shadow-md hover:shadow-violet-200 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-violet-100/30 blur-3xl animate-pulse-soft" />
        <div className="absolute top-20 right-0 h-[300px] w-[400px] rounded-full bg-violet-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center rounded-full border border-violet-200/60 bg-violet-50/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm shadow-violet-100 backdrop-blur-sm">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse-soft" />
              Property Management, Simplified
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Manage your properties{' '}
              <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                with confidence
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
              ZenPortal brings landlords, property managers, and tenants together in one
              platform. Handle leases, maintenance requests, payments, and communications
              -- all from a single dashboard.
            </p>
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-block rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-violet-300/50 hover:from-violet-700 hover:to-violet-600 active:scale-[0.98]"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative border-t border-slate-100/60 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage properties
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Powerful tools designed for modern property management.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            <FeatureCard
              icon={Building2}
              title="Property Management"
              description="Track all your properties, units, and occupancy rates in one centralized dashboard."
            />
            <FeatureCard
              icon={FileText}
              title="Lease Tracking"
              description="Manage lease agreements, renewals, and expirations with automated reminders."
            />
            <FeatureCard
              icon={Wrench}
              title="Maintenance Requests"
              description="Streamline maintenance workflows from request to resolution with priority tracking."
            />
            <FeatureCard
              icon={Shield}
              title="Tenant Applications"
              description="Process rental applications with built-in screening and approval workflows."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-100/60 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-violet-600 via-violet-600 to-purple-600 px-8 py-16 text-center shadow-xl shadow-violet-300/30 sm:px-16">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to streamline your property management?
            </h2>
            <p className="mt-4 text-violet-100">
              Join property managers who trust ZenPortal to simplify their daily operations.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-violet-700 shadow-sm transition-all hover:bg-violet-50 hover:shadow-md"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-sm font-semibold text-slate-600">{APP_NAME}</span>
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} ZenPortal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="group relative rounded-xl border border-slate-200/60 bg-white p-6 transition-all duration-300 hover:border-violet-200/80 hover:shadow-lg hover:shadow-violet-50 hover:-translate-y-0.5">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 transition-all duration-300 group-hover:bg-violet-100 group-hover:shadow-sm group-hover:shadow-violet-100">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </div>
  )
}

