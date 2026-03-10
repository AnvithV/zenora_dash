'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, Shield, Bell } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function SettingsPage() {
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

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
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
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
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1></div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-semibold">Security</h2></div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Password</p>
              <p className="text-sm text-gray-500">Change your account password</p>
              <button
                onClick={() => setPasswordOpen(true)}
                className="mt-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Change Password
              </button>
              {passwordSuccess && <p className="mt-2 text-sm text-green-600">Password changed successfully!</p>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-purple-600" /><h2 className="text-lg font-semibold">Notifications</h2></div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Email notifications for maintenance updates</span>
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Email notifications for announcements</span>
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Email notifications for lease renewals</span>
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          <p className="mt-2 text-sm text-gray-500">Sign out of your account</p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
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
