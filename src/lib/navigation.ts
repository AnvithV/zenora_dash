import {
  Building2, Home, Users, FileText, Wrench, Bell, Activity, Settings, LayoutDashboard, ClipboardList, FileBox, Shield, MessageSquare, FileUp
} from 'lucide-react'

export const adminNavItems = [
  { label: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
  { label: 'Properties', href: '/admin/properties', icon: Building2 },
  { label: 'Units', href: '/admin/units', icon: Home },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Leases', href: '/admin/leases', icon: FileText },
  { label: 'Applications', href: '/admin/applications', icon: ClipboardList },
  { label: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
  { label: 'Documents', href: '/admin/documents', icon: FileBox },
  { label: 'User Documents', href: '/admin/user-documents', icon: FileUp },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Announcements', href: '/admin/announcements', icon: Bell },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'System', href: '/admin/system', icon: Shield },
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
