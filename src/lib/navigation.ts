import {
  Building2, Home, Users, FileText, Wrench, Bell, Activity, Settings, LayoutDashboard, ClipboardList, FileBox, Shield, MessageSquare, FileUp
} from 'lucide-react'

export const adminNavItems = [
  { label: 'Users', href: '/admin/users', icon: Users },
]

export const userNavItems = [
  { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Lease', href: '/dashboard/lease', icon: FileText },
  { label: 'Documents', href: '/dashboard/documents', icon: FileBox },
  { label: 'Notices', href: '/dashboard/notices', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: Users },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]
