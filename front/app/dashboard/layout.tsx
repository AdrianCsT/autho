"use client"

import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SidebarMenuItem } from "@/components/layout/sidebar"
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Mail,
  Package,
  Settings,
  Shield,
  Users
} from "lucide-react"

const sidebarItems: SidebarMenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    icon: Users,
    items: [
      {
        title: "All Users",
        href: "/dashboard/users",
      },
      {
        title: "Add User",
        href: "/dashboard/users/new",
      },
    ],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Products",
    icon: Package,
    items: [
      {
        title: "All Products",
        href: "/dashboard/products",
      },
      {
        title: "Categories",
        href: "/dashboard/products/categories",
      },
    ],
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: CreditCard,
    badge: "12",
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: Mail,
    badge: 5,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Admin",
    icon: Shield,
    roles: ["admin"],
    items: [
      {
        title: "System Settings",
        href: "/dashboard/admin/settings",
      },
      {
        title: "Permissions",
        href: "/dashboard/admin/permissions",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()

  // Don't render ANYTHING until user data is loaded
  if (!user) {
    return null
  }

  const menuUser = {
    name: user.username,
    email: user.id,
    roles: [user.role],
  }

  return (
    <DashboardLayout
      user={menuUser}
      sidebarItems={sidebarItems}
      onLogout={logout}
      userRoles={[user.role]}
    >
      {children}
    </DashboardLayout>
  )
}
