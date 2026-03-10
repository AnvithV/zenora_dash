'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { getRoleLabel } from '@/lib/auth-utils'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const user = session?.user

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
    }
    // Fetch full profile (session doesn't include phone)
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setPhone(data.data.phone ?? '')
          if (data.data.name) setName(data.data.name)
        }
      })
      .catch(() => {})
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      if (res.ok) {
        await updateSession({ name })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Profile</h1></div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            {user?.image ? (
              <Image src={user.image} alt="" width={64} height={64} className="h-16 w-16 rounded-full" />
            ) : (
              <User className="h-8 w-8 text-violet-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name ?? 'Unnamed User'}</h2>
            <p className="text-slate-500">{user?.email}</p>
            <p className="text-sm text-slate-400">{getRoleLabel(user?.role ?? 'TENANT')}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" disabled value={user?.email ?? ''} className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <input type="text" disabled value={getRoleLabel(user?.role ?? 'TENANT')} className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
