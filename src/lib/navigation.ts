import {
  Building2, Home, Users, FileText, Wrench, Bell, Activity, Settings, LayoutDashboard, ClipboardList, FileBox, Shield, MessageSquare, FileUp, DollarSign
} from 'lucide-react'

export const adminNavItems = [
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
]

export const landlordNavItems = [
  { label: 'Tenants', href: '/landlord/tenants', icon: Users },
  { label: 'Payments', href: '/landlord/payments', icon: DollarSign },
  { label: 'Messages', href: '/landlord/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/landlord/notifications', icon: Bell },
  { label: 'Settings', href: '/landlord/settings', icon: Settings },
]

export const userNavItems = [
  { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Lease', href: '/dashboard/lease', icon: FileText },
  { label: 'Documents', href: '/dashboard/documents', icon: FileBox },
  { label: 'Notices', href: '/dashboard/notices', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: Users },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]
