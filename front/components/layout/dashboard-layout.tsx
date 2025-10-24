"use client"

import * as React from "react"
import { Menu, MenuUser } from "./menu"
import { Sidebar, SidebarMenuItem } from "./sidebar"
import { NotificationsSidebar, Notification } from "./notifications-sidebar"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  user?: MenuUser
  sidebarItems: SidebarMenuItem[]
  onLogout?: () => void
  children: React.ReactNode
  menuChildren?: React.ReactNode
  className?: string
  userRoles?: string[]
  logo?: React.ReactNode
}

// Sample notifications - in real app, fetch from API
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Order completed",
    message: "Your order #1234 has been successfully processed and shipped.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "New user registered",
    message: "John Doe has created a new account and is pending approval.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Low stock alert",
    message: "Product 'Widget Pro' is running low on inventory (5 items left).",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "error",
    title: "Payment failed",
    message: "Payment for order #5678 was declined. Please review.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "5",
    type: "info",
    title: "System update",
    message: "A new system update is available. Update now to get the latest features.",
    time: "1 day ago",
    read: true,
  },
]

export function DashboardLayout({
  user,
  sidebarItems,
  onLogout,
  children,
  menuChildren,
  className,
  userRoles = [],
  logo,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>(sampleNotifications)

  const handleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleNotificationDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar 
          items={sidebarItems} 
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          userRoles={userRoles}
          logo={logo}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] transform transition-transform duration-300 md:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar 
          items={sidebarItems}
          userRoles={userRoles}
          logo={logo}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Menu
          user={user}
          onLogout={onLogout}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onToggleNotifications={() => setNotificationsOpen(!notificationsOpen)}
          notificationCount={unreadCount}
        >
          {menuChildren}
        </Menu>

        <main className={cn("flex-1 overflow-y-auto", className)}>
          {children}
        </main>
      </div>

      {/* Notifications Sidebar */}
      <NotificationsSidebar
        notifications={notifications}
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNotificationRead={handleNotificationRead}
        onNotificationDelete={handleNotificationDelete}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />
    </div>
  )
}
