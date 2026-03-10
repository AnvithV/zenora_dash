import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth-utils'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    if (isAdminRole(session.user.role)) {
      redirect('/admin/overview')
    } else {
      redirect('/dashboard/overview')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">ZenPortal</h1>
        <p className="text-lg text-gray-600">Property Management Dashboard</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
