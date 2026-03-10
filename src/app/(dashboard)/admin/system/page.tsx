'use client'

import { Shield, Database, Server, Clock } from 'lucide-react'

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">System</h1><p className="text-gray-500">System information and configuration</p></div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Server className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-semibold">Application</h2></div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Framework</span><span className="text-sm font-medium">Next.js 15</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Runtime</span><span className="text-sm font-medium">Node.js</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Auth</span><span className="text-sm font-medium">Auth.js v5</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Environment</span><span className="text-sm font-medium">{process.env.NODE_ENV}</span></div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Database className="h-5 w-5 text-green-600" /><h2 className="text-lg font-semibold">Database</h2></div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Engine</span><span className="text-sm font-medium">PostgreSQL</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">ORM</span><span className="text-sm font-medium">Prisma</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Multi-tenancy</span><span className="text-sm font-medium">Shared schema</span></div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-purple-600" /><h2 className="text-lg font-semibold">Security</h2></div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Session Type</span><span className="text-sm font-medium">JWT</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Route Protection</span><span className="text-sm font-medium">Middleware + Service Layer</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Input Validation</span><span className="text-sm font-medium">Zod</span></div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-600" /><h2 className="text-lg font-semibold">Audit</h2></div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Logging</span><span className="text-sm font-medium">All entity mutations</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Retention</span><span className="text-sm font-medium">Unlimited</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
