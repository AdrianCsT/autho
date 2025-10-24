"use client"

import * as React from "react"
import { Bell, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  time: string
  read: boolean
}

interface NotificationsSidebarProps {
  notifications: Notification[]
  open: boolean
  onClose: () => void
  onNotificationRead?: (id: string) => void
  onNotificationDelete?: (id: string) => void
  onMarkAllRead?: () => void
  onClearAll?: () => void
}

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return "bg-green-500/10 text-green-700 dark:text-green-400"
    case "warning":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    case "error":
      return "bg-red-500/10 text-red-700 dark:text-red-400"
    default:
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
  }
}

export function NotificationsSidebar({
  notifications,
  open,
  onClose,
  onNotificationRead,
  onNotificationDelete,
  onMarkAllRead,
  onClearAll,
}: NotificationsSidebarProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] w-full sm:w-96 bg-background border-l shadow-lg transform transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-base font-medium mb-1">No notifications</p>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group flex gap-3 px-4 py-4 cursor-pointer transition-colors",
                      !notification.read && "bg-muted/30 hover:bg-muted/40",
                      notification.read && "hover:bg-muted/20"
                    )}
                    onClick={() => onNotificationRead?.(notification.id)}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      getNotificationColor(notification.type)
                    )}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-tight">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-background/80"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNotificationDelete?.(notification.id)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="border-t p-3 space-y-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onMarkAllRead}
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full text-muted-foreground hover:text-destructive"
              onClick={onClearAll}
            >
              Clear all notifications
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
