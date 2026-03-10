'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { getRoleLabel } from '@/lib/auth-utils'
import { User, LogOut, Shield } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function LandlordSettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const user = session?.user

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (user) setName(user.name ?? '')
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setPasswordError(json.error ?? 'Failed to change password')
        return
      }
      setPasswordOpen(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError('Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your profile and account</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
              <p className="text-sm text-slate-400">{getRoleLabel(user?.role ?? 'LANDLORD')}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                disabled
                value={user?.email ?? ''}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
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

        {/* Security */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">Password</p>
            <p className="text-sm text-slate-500">Change your account password</p>
            <button
              onClick={() => setPasswordOpen(true)}
              className="mt-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Change Password
            </button>
            {passwordSuccess && <p className="mt-2 text-sm text-green-600">Password changed successfully!</p>}
          </div>
        </div>

        {/* Sign Out */}
        <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          <p className="mt-2 text-sm text-slate-500">Sign out of your account</p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <input type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            <DialogFooter>
              <button type="button" onClick={() => setPasswordOpen(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={passwordLoading} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
